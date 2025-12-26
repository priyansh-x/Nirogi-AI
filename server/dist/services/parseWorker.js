"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runParseJob = void 0;
const client_1 = require("@prisma/client");
const reducto_1 = require("./reducto");
const adobeExtract_1 = require("./adobeExtract");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
// Polling interval in ms
const POLL_INTERVAL = 5000;
const runParseJob = async (documentId) => {
    console.log(`[Worker] Starting job for document ${documentId}`);
    try {
        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            console.error(`[Worker] Document ${documentId} not found`);
            return;
        }
        const provider = process.env.PARSER_PROVIDER || 'mock';
        if (provider === 'adobe') {
            console.log(`[Worker] Using Adobe Extract provider for ${documentId}`);
            // Update Document Status
            await prisma.document.update({
                where: { id: documentId },
                data: { status: 'PARSING' }
            });
            const jobId = (0, uuid_1.v4)();
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
                const { structuredData } = await (0, adobeExtract_1.adobeExtractFromFile)(document.storageUrl);
                // Normalize Adobe Data to Schema
                // Adobe elements: { Text: string, Page: number, Path: string, Bounds: [l,b,r,t], ... }
                // We put all text into one large chunk for now, or per page.
                // Let's create one chunk per page to be safe, or just one big chunk.
                // Simple approach: One chunk, all blocks linked to it.
                const elements = structuredData.elements || [];
                let fullText = "";
                const blocksToCreate = [];
                elements.forEach((el, index) => {
                    if (el.Text) {
                        fullText += el.Text + "\n";
                        // Adobe Bounds: [left, bottom, right, top] (PDF coords usually)
                        // Our schema expects: bboxPage, bboxLeft, bboxTop, bboxWidth, bboxHeight
                        let bbox = { page: 0, left: 0, top: 0, width: 0, height: 0 };
                        if (el.Bounds && el.Bounds.length === 4) {
                            // Assuming Page follows element, or default 1
                            bbox.page = el.Page || 1;
                            bbox.left = el.Bounds[0];
                            // Adobe bottom is Y from bottom? verify sdk. 
                            // For MVP just storing raw numbers.
                            bbox.top = el.Bounds[3]; // Top assumes PDF coords, might range.
                            bbox.width = el.Bounds[2] - el.Bounds[0];
                            bbox.height = el.Bounds[3] - el.Bounds[1];
                        }
                        blocksToCreate.push({
                            parseJobId: parseJob.id,
                            chunkIndex: 0,
                            blockIndex: index,
                            type: el.Path || 'text', // e.g. //Document/P
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
                        content: fullText
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
            }
            catch (err) {
                console.error(`[Worker] Adobe Extract Failed:`, err);
                await prisma.parseJob.update({
                    where: { id: parseJob.id },
                    data: { status: 'FAILED', reason: err.message }
                });
                await prisma.document.update({
                    where: { id: documentId },
                    data: { status: 'ERROR' }
                });
            }
            return;
        }
        let reductoFileId = document.reductoFileId;
        // 1. Upload if needed
        if (!reductoFileId) {
            console.log(`[Worker] Uploading file to Reducto...`);
            // Assuming storageUrl is local path for MVP
            if (!fs_1.default.existsSync(document.storageUrl)) {
                throw new Error(`File not found at ${document.storageUrl}`);
            }
            const uploadRes = await (0, reducto_1.uploadToReducto)(document.storageUrl, document.mimeType);
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
            const parseRes = await (0, reducto_1.startParse)(reductoFileId);
            jobId = parseRes.jobId;
            await prisma.document.update({
                where: { id: documentId },
                data: { reductoJobId: jobId, status: 'PARSING' } // Enum as String
            });
            // Create ParseJob record
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
            const currentJob = await (0, reducto_1.retrieveParse)(jobId);
            console.log(`[Worker] Job ${jobId} status: ${currentJob.status}`);
            // Update local job status
            // Map Reducto status to our schema status strings
            // Schema: PENDING, RUNNING, COMPLETED, FAILED
            // API: PENDING, SUCCESS, FAILED, COMPLETED
            let mappedStatus = 'RUNNING';
            if (currentJob.status === 'FAILED')
                mappedStatus = 'FAILED';
            if (currentJob.status === 'COMPLETED' || currentJob.status === 'SUCCESS')
                mappedStatus = 'COMPLETED';
            if (currentJob.status === 'PENDING')
                mappedStatus = 'PENDING';
            await prisma.parseJob.updateMany({
                where: { jobId: jobId },
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
                // Determine result source
                let rawResult = currentJob.result;
                let finalChunks = [];
                if (rawResult?.type === 'url' && rawResult.url) {
                    console.log(`[Worker] Fetching large result from URL...`);
                    finalChunks = await (0, reducto_1.downloadChunksFromUrl)(rawResult.url);
                    if (Array.isArray(finalChunks)) {
                        rawResult = { type: 'url', chunks: finalChunks, url: rawResult.url };
                    }
                    else {
                        rawResult = finalChunks;
                    }
                }
                else if (rawResult?.type === 'full') {
                    // use rawResult directly
                }
                // Normalize and Save
                const { chunks, blocks } = (0, reducto_1.normalizeReductoChunks)(rawResult);
                // Get the ParseJob ID to link chunks
                const parseJobRecord = await prisma.parseJob.findFirst({ where: { jobId: jobId } });
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
                console.log(`[Worker] Job ${jobId} finished successfully.`);
            }
            else if (mappedStatus === 'FAILED') {
                await prisma.document.update({
                    where: { id: documentId },
                    data: { status: 'ERROR' }
                });
                console.error(`[Worker] Job ${jobId} failed.`);
            }
            else {
                // Continue polling
                setTimeout(poll, POLL_INTERVAL);
            }
        };
        poll();
    }
    catch (error) {
        console.error(`[Worker] Error in runParseJob:`, error);
        // Mark as error
        await prisma.document.update({
            where: { id: documentId },
            data: { status: 'ERROR' }
        });
    }
};
exports.runParseJob = runParseJob;
