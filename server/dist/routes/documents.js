"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const parseWorker_1 = require("../services/parseWorker");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Multer setup
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
// POST /api/v1/patients/:id/documents
router.post('/patients/:patientId/documents', upload.single('file'), async (req, res) => {
    try {
        const { patientId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
            // For MVP, if patient missing, maybe auto-create or error. 
            // We'll require existing patient.
            return res.status(404).json({ error: 'Patient not found' });
        }
        const doc = await prisma.document.create({
            data: {
                patientId,
                type: 'OTHER',
                fileName: file.originalname,
                mimeType: file.mimetype,
                storageUrl: file.path,
                status: 'UPLOADED'
            }
        });
        res.status(201).json(doc);
    }
    catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/patients/:patientId/documents
router.get('/patients/:patientId/documents', async (req, res) => {
    try {
        const { patientId } = req.params;
        const docs = await prisma.document.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
            include: { parseJobs: { take: 1, orderBy: { createdAt: 'desc' } } }
        });
        res.json(docs);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/v1/documents/:docId/parse
router.post('/documents/:docId/parse', async (req, res) => {
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
        (0, parseWorker_1.runParseJob)(docId);
        res.json({ ok: true, documentId: docId, message: 'Parse job started' });
    }
    catch (error) {
        console.error('Parse Trigger Error:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/documents/:docId/parse-status
router.get('/documents/:docId/parse-status', async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/v1/documents/:docId/parsed (Debug View)
router.get('/documents/:docId/parsed', async (req, res) => {
    try {
        const { docId } = req.params;
        const job = await prisma.parseJob.findFirst({
            where: { documentId: docId, status: { in: ['COMPLETED', 'SUCCESS'] } }, // Handle prisma string type
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
