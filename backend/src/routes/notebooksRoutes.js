import express from 'express';
import {
    getAllNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
} from '../controllers/notebooksController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllNotebooks);
router.post("/", createNotebook);
router.put("/:id", updateNotebook);
router.delete("/:id", deleteNotebook);

export default router;
