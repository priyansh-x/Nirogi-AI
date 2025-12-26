"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET current user (mocked to first user for MVP)
router.get('/me', async (req, res) => {
    try {
        // In real app, extract ID from JWT
        const user = await prisma.user.findFirst();
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Remove password
        const { password, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH update user
router.patch('/me', async (req, res) => {
    try {
        const { name, email } = req.body;
        // Mock ID
        const user = await prisma.user.findFirst();
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { name, email }
        });
        const { password, ...safeUser } = updated;
        res.json(safeUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
