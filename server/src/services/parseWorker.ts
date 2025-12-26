import { PrismaClient } from '@prisma/client';
import { uploadToReducto, startParse, retrieveParse, downloadChunksFromUrl, normalizeReductoChunks } from './reducto';
import { adobeExtractFromFile } from './adobeExtract';
import { extractFacts } from './simpleExtractor';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Polling interval in ms
const POLL_INTERVAL = 5000;

export const runParseJob = async (documentId: string) => {
    console.log(`[Worker] Starting job for document ${documentId}`);

    try {
        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            console.error(`[Worker] Document ${documentId} not found`);
            return;
        }

        const provider = process.env.PARSER_PROVIDER || 'mock';
        let fullExtractedText = "";

        if (provider === 'adobe') {
            console.log(`[Worker] Using Adobe Extract provider for ${documentId}`);

            // Update Document Status
            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'PARSING' }
            });

            const jobId = uuidv4();

            // Create ParseJob record
            const parseJob = await prisma.parseJob.create({
                data: {
                    documentId,
                    vendor: 'adobe',
                    jobId: jobId,
                    status: 'RUNNING'
                }
            });

            try {
                const { structuredData } = await adobeExtractFromFile(document.storageUrl);

                const elements = structuredData.elements || [];
                const blocksToCreate: any[] = [];

                elements.forEach((el: any, index: number) => {
                    if (el.Text) {
                        const text = el.Text.trim();
                        if (text) {
                            fullExtractedText += text + "\n";
                        }

                        let bbox = { page: 0, left: 0, top: 0, width: 0, height: 0 };
                        if (el.Bounds && el.Bounds.length === 4) {
                            bbox.page = el.Page || 1;
                            bbox.left = el.Bounds[0];
                            bbox.top = el.Bounds[3];
                            bbox.width = el.Bounds[2] - el.Bounds[0];
                            bbox.height = el.Bounds[3] - el.Bounds[1];
                        }

                        blocksToCreate.push({
                            parseJobId: parseJob.id,
                            chunkIndex: 0,
                            blockIndex: index,
                            type: el.Path || 'text',
                            content: el.Text,
                            bboxPage: bbox.page,
                            bboxLeft: bbox.left,
                            bboxTop: bbox.top,
                            bboxWidth: bbox.width,
                            bboxHeight: bbox.height,
                            confidence: "1.0"
                        });
                    }
                });

                // Create Single Chunk
                await prisma.parsedChunk.create({
                    data: {
                        parseJobId: parseJob.id,
                        chunkIndex: 0,
                        content: fullExtractedText
                    }
                });

                // Create Blocks
                for (const block of blocksToCreate) {
                    await prisma.parsedBlock.create({ data: block });
                }

                // Update Job & Document
                await prisma.parseJob.update({
                    where: { id: parseJob.id },
                    data: { status: 'COMPLETED', progress: 100 }
                });

                await prisma.document.update({
                    where: { id: documentId },
                    data: { status: 'PARSED' }
                });

                console.log(`[Worker] Adobe Job ${jobId} finished successfully.`);

            } catch (err: any) {
                console.error(`[Worker] Adobe Extract Failed:`, err);
                await prisma.parseJob.update({
                    where: { id: parseJob.id },
                    data: { status: 'FAILED', reason: err.message }
                });
                await prisma.document.update({
                    where: { id: documentId },
                    data: { status: 'ERROR' }
                });
                return;
            }
        } else {
            // REDUCTO FLOW
            let reductoFileId = document.reductoFileId;

            // 1. Upload if needed
            if (!reductoFileId) {
                console.log(`[Worker] Uploading file to Reducto...`);
                // Assuming storageUrl is local path for MVP
                if (!fs.existsSync(document.storageUrl)) {
                    throw new Error(`File not found at ${document.storageUrl}`);
                }
                const uploadRes = await uploadToReducto(document.storageUrl, document.mimeType);
                reductoFileId = uploadRes.fileId;

                await prisma.document.update({
                    where: { id: documentId },
                    data: { reductoFileId }
                });
            }

            // 2. Start Parse if needed
            let jobId = document.reductoJobId;
            if (!jobId) {
                console.log(`[Worker] Starting parse job...`);
                const parseRes = await startParse(reductoFileId!);
                jobId = parseRes.jobId;

                await prisma.document.update({
                    where: { id: documentId },
                    data: { reductoJobId: jobId, status: 'PARSING' }
                });

                await prisma.parseJob.create({
                    data: {
                        documentId,
                        jobId,
                        status: 'PENDING'
                    }
                });
            }

            // 3. Poll for completion
            const poll = async () => {
                const currentJob = await retrieveParse(jobId!);
                console.log(`[Worker] Job ${jobId} status: ${currentJob.status}`);

                let mappedStatus = 'RUNNING';
                if (currentJob.status === 'FAILED') mappedStatus = 'FAILED';
                if (currentJob.status === 'COMPLETED' || currentJob.status === 'SUCCESS') mappedStatus = 'COMPLETED';
                if (currentJob.status === 'PENDING') mappedStatus = 'PENDING';

                await prisma.parseJob.updateMany({
                    where: { jobId: jobId! },
                    data: {
                        status: mappedStatus,
                        progress: currentJob.progress ?? null,
                        reason: currentJob.reason ?? null,
                        studioLink: currentJob.studio_link,
                        durationSeconds: currentJob.duration,
                        usageNumPages: currentJob.usage?.num_pages,
                        usageCredits: currentJob.usage?.credits,
                        resultType: currentJob.result?.type
                    }
                });

                if (mappedStatus === 'COMPLETED') {
                    let rawResult: any = currentJob.result;
                    let finalChunks: any[] = [];

                    if (rawResult?.type === 'url' && rawResult.url) {
                        console.log(`[Worker] Fetching large result from URL...`);
                        finalChunks = await downloadChunksFromUrl(rawResult.url);
                        if (Array.isArray(finalChunks)) {
                            rawResult = { type: 'url', chunks: finalChunks, url: rawResult.url };
                        } else {
                            rawResult = finalChunks;
                        }
                    }

                    const { chunks, blocks } = normalizeReductoChunks(rawResult);

                    // Accumulate text
                    chunks.forEach(c => fullExtractedText += c.content + "\n");

                    const parseJobRecord = await prisma.parseJob.findFirst({ where: { jobId: jobId! } });

                    if (parseJobRecord) {
                        for (const chunk of chunks) {
                            await prisma.parsedChunk.create({
                                data: {
                                    parseJobId: parseJobRecord.id,
                                    chunkIndex: chunk.chunkIndex,
                                    content: chunk.content
                                }
                            });
                        }

                        for (const block of blocks) {
                            await prisma.parsedBlock.create({
                                data: {
                                    parseJobId: parseJobRecord.id,
                                    chunkIndex: block.chunkIndex,
                                    blockIndex: block.blockIndex,
                                    type: block.type,
                                    content: block.content,
                                    bboxPage: block.bbox.page,
                                    bboxLeft: block.bbox.left,
                                    bboxTop: block.bbox.top,
                                    bboxWidth: block.bbox.width,
                                    bboxHeight: block.bbox.height,
                                    confidence: String(block.confidence || "0")
                                }
                            });
                        }
                    }

                    await prisma.document.update({
                        where: { id: documentId },
                        data: { status: 'PARSED' }
                    });

                    // Trigger Extraction after Reducto parse
                    if (fullExtractedText) {
                        await performExtraction(documentId, fullExtractedText, document.patientId);
                    }

                    console.log(`[Worker] Job ${jobId} finished successfully.`);
                } else if (mappedStatus === 'FAILED') {
                    await prisma.document.update({
                        where: { id: documentId },
                        data: { status: 'ERROR' }
                    });
                    console.error(`[Worker] Job ${jobId} failed.`);
                } else {
                    setTimeout(poll, POLL_INTERVAL);
                }
            };
            poll();
            return; // Exit here for Reducto async flow
        }

        // If we reached here, it was Adobe flow (sync-ish in this block)
        // Perform Extraction for Adobe result
        if (fullExtractedText) {
            await performExtraction(documentId, fullExtractedText, document.patientId);
        }

    } catch (error) {
        console.error(`[Worker] Error in runParseJob:`, error);
        await prisma.document.update({
            where: { id: documentId },
            data: { status: 'ERROR' }
        });
    }
};

// Helper for Extraction
async function performExtraction(documentId: string, text: string, patientId: string) {
    console.log(`[Worker] Running Heuristic Extraction for ${documentId}...`);
    try {
        const facts = extractFacts(text);

        // Clear previous facts for this doc if any (simple approach)
        await prisma.structuredFact.deleteMany({ where: { documentId } });

        for (const fact of facts) {
            await prisma.structuredFact.create({
                data: {
                    patientId,
                    documentId,
                    factType: fact.type,
                    dataJson: JSON.stringify({ value: fact.value, description: fact.description }),
                    confidence: fact.confidence,
                    evidenceJson: JSON.stringify({ quote: fact.value }), // Simple evidence
                }
            });
        }
        console.log(`[Worker] Extracted ${facts.length} facts.`);
    } catch (err) {
        console.error(`[Worker] Extraction failed:`, err);
    }
}
