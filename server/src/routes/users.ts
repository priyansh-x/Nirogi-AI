import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET current user (mocked to first user for MVP)
router.get('/me', async (req, res) => {
    try {
        // In real app, extract ID from JWT
        const user = await prisma.user.findFirst();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Remove password
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH update user
router.patch('/me', async (req, res) => {
    try {
        const { name, email } = req.body;
        // Mock ID
        const user = await prisma.user.findFirst();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { name, email }
        });

        const { password, ...safeUser } = updated;
        res.json(safeUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
