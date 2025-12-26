"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET all patients
router.get('/', async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { documents: true }
                }
            }
        });
        res.json(patients);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single patient
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await prisma.patient.findUnique({
            where: { id }
        });
        if (!patient)
            return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
