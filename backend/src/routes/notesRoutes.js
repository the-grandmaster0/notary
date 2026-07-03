import express from 'express';
import {
    createNote,
    deleteNote,
    getAllNotes,
    getTrashedNotes,
    toggleStar,
    updateNote,
    restoreNote,
    permanentDeleteNote,
    getUserTags,
} from '../controllers/notesController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllNotes);
router.get("/trash", getTrashedNotes);
router.get("/tags", getUserTags);
router.post("/", createNote);
router.put("/:id", updateNote);
router.put("/:id/star", toggleStar);
router.put("/:id/restore", restoreNote);
router.delete("/:id", deleteNote);
router.delete("/:id/permanent", permanentDeleteNote);

export default router;
