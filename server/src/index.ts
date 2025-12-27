import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import patientRoutes from './routes/patients';
import userRoutes from './routes/users';

// Middleware
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL, // e.g. https://nirogi-ai.vercel.app
    'https://nirogi-ai.vercel.app' // Hardcoded fallback for safety during debug
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(null, true); // Create open CORS policy for debugging purposes if needed, or fail: callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Verify uploads directory
const uploadsDir = path.join(__dirname, '../../uploads'); // Adjust path to be outside source but handled correctly
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

// Auth Routes (Public)
app.use('/api/v1/auth', authRoutes);

// Protected Routes
// For MVP, we apply auth middleware to all these. 
// Note: Document upload/parse relies on user context? 
// Current impl doesn't strictly use req.user in controllers yet, but we gate access here.
app.use('/api/v1/patients', authenticateToken, patientRoutes);
app.use('/api/v1/documents', authenticateToken, documentRoutes);
app.use('/api/v1/users', authenticateToken, userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
