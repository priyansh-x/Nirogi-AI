"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const documents_1 = __importDefault(require("./routes/documents"));
const patients_1 = __importDefault(require("./routes/patients"));
const users_1 = __importDefault(require("./routes/users"));
// Middleware
const auth_2 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Verify uploads directory
const uploadsDir = path_1.default.join(__dirname, '../../uploads'); // Adjust path to be outside source but handled correctly
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});
// Auth Routes (Public)
app.use('/api/v1/auth', auth_1.default);
// Protected Routes
// For MVP, we apply auth middleware to all these. 
// Note: Document upload/parse relies on user context? 
// Current impl doesn't strictly use req.user in controllers yet, but we gate access here.
app.use('/api/v1/patients', auth_2.authenticateToken, patients_1.default);
app.use('/api/v1/documents', auth_2.authenticateToken, documents_1.default);
app.use('/api/v1/users', auth_2.authenticateToken, users_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
