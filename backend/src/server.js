import express from 'express';
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notebooksRoutes from './routes/notebooksRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server.js is at backend/src/server.js
// .env is at backend/.env  →  one level up: ../
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// uploads folder is at backend/uploads  →  one level up from src/: ../uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const allowedOrigins = process.env.NODE_ENV === "production"
    ? ["https://notary-beta.vercel.app"]
    : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/notebooks", notebooksRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
