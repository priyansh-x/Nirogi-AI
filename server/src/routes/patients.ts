import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// GET all patients (Filtered by Role)
router.get('/', async (req, res) => {
    try {
        const user = (req as any).user;
        const whereClause: any = {};

        // If 'PATIENT' role, only show their own profile
        if (user.role === 'PATIENT') {
            whereClause.userId = user.id;
        }
        // Doctors and Admins see all (no filter needed)

        const patients = await prisma.patient.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { documents: true }
                }
            }
        });
        res.json(patients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET single patient
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: { structuredFacts: true }
        });

        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        // RBAC Check: If user is PATIENT, they can only view their own record
        if (user.role === 'PATIENT' && patient.userId !== user.id) {
            return res.status(403).json({ error: 'Access denied: You can only view your own profile.' });
        }

        res.json(patient);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create patient
router.post('/', async (req, res) => {
    try {
        const { displayName, dob, sex, createdByUserId } = req.body;

        // For MVP, if createdByUserId is not provided, pick the first admin user or a default
        // In real app, this comes from auth token
        let userId = createdByUserId;
        if (!userId) {
            const demoUser = await prisma.user.findFirst();
            userId = demoUser?.id;
        }

        if (!userId) {
            return res.status(400).json({ error: 'No user found to attribute creation to. Run seed.' });
        }

        const patient = await prisma.patient.create({
            data: {
                displayName,
                dob: dob ? new Date(dob) : null,
                sex,
                createdByUserId: userId
            }
        });
        res.status(201).json(patient);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /:id/documents
router.post('/:id/documents', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const patient = await prisma.patient.findUnique({ where: { id } });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const doc = await prisma.document.create({
            data: {
                patientId: id,
                type: 'OTHER',
                fileName: file.originalname,
                mimeType: file.mimetype,
                storageUrl: file.path,
                status: 'UPLOADED'
            }
        });

        res.status(201).json(doc);
    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /:id/documents
router.get('/:id/documents', async (req, res) => {
    try {
        const { id } = req.params;
        const docs = await prisma.document.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' },
            include: { parseJobs: { take: 1, orderBy: { createdAt: 'desc' } } }
        });
        res.json(docs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
