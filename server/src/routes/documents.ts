import express from 'express';
import { PrismaClient } from '@prisma/client';
import { runParseJob } from '../services/parseWorker';

const router = express.Router();
const prisma = new PrismaClient();

// POST /:docId/parse
router.post('/:docId/parse', async (req, res) => {
    try {
        const { docId } = req.params;

        const doc = await prisma.document.findUnique({ where: { id: docId } });
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const existingJob = await prisma.parseJob.findFirst({
            where: {
                documentId: docId,
                status: {
                    in: ['PENDING', 'RUNNING']
                }
            }
        });

        if (existingJob) {
            return res.json({
                ok: true,
                documentId: docId,
                parseJobId: existingJob.id,
                message: 'Job already running'
            });
        }

        runParseJob(docId);

        res.json({ ok: true, documentId: docId, message: 'Parse job started' });

    } catch (error: any) {
        console.error('Parse Trigger Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /:docId/parse-status
router.get('/:docId/parse-status', async (req, res) => {
    try {
        const { docId } = req.params;
        const doc = await prisma.document.findUnique({ where: { id: docId } });

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const job = await prisma.parseJob.findFirst({
            where: { documentId: docId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { parsedChunks: true, parsedBlocks: true }
                }
            }
        });

        res.json({
            documentStatus: doc.status,
            parseJob: job ? {
                status: job.status,
                progress: job.progress,
                reason: job.reason,
                chunksCount: job._count.parsedChunks,
                blocksCount: job._count.parsedBlocks
            } : null
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /:docId/parsed (Debug View)
router.get('/:docId/parsed', async (req, res) => {
    try {
        const { docId } = req.params;

        const job = await prisma.parseJob.findFirst({
            where: { documentId: docId, status: { in: ['COMPLETED', 'SUCCESS'] as any } }, // Handle prisma string type
            orderBy: { createdAt: 'desc' },
            include: {
                parsedChunks: { orderBy: { chunkIndex: 'asc' } },
                parsedBlocks: { orderBy: [{ chunkIndex: 'asc' }, { blockIndex: 'asc' }] }
            }
        });

        // Note: For 'status', using string literals directly since I removed Enums. 
        // Logic: find status 'COMPLETED'.

        if (!job) {
            return res.status(404).json({ error: 'No completed parse job found' });
        }

        res.json({
            chunks: job.parsedChunks,
            blocks: job.parsedBlocks
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
