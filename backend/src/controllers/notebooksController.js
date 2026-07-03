import Notebook from '../models/Notebook.js';
import Note from '../models/Note.js';

// GET /api/notebooks
export async function getAllNotebooks(req, res) {
    try {
        const notebooks = await Notebook.find({ userId: req.user._id }).sort({ createdAt: 1 });

        // Attach note count to each notebook
        const withCounts = await Promise.all(
            notebooks.map(async (nb) => {
                const count = await Note.countDocuments({
                    userId: req.user._id,
                    notebookId: nb._id,
                    deletedAt: null,
                });
                return { ...nb.toObject(), noteCount: count };
            })
        );

        res.status(200).json(withCounts);
    } catch (error) {
        console.log("Error in getAllNotebooks", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// POST /api/notebooks
export async function createNotebook(req, res) {
    try {
        const { name, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Notebook name is required" });
        }

        const exists = await Notebook.findOne({ userId: req.user._id, name: name.trim() });
        if (exists) {
            return res.status(400).json({ error: "A notebook with that name already exists" });
        }

        const notebook = new Notebook({
            userId: req.user._id,
            name: name.trim(),
            color: color || "default",
        });

        await notebook.save();
        res.status(201).json({ ...notebook.toObject(), noteCount: 0 });
    } catch (error) {
        console.log("Error in createNotebook", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PUT /api/notebooks/:id
export async function updateNotebook(req, res) {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const notebook = await Notebook.findOne({ _id: id, userId: req.user._id });
        if (!notebook) return res.status(404).json({ error: "Notebook not found" });

        if (name !== undefined) notebook.name = name.trim();
        if (color !== undefined) notebook.color = color;

        await notebook.save();

        const noteCount = await Note.countDocuments({
            userId: req.user._id,
            notebookId: notebook._id,
            deletedAt: null,
        });

        res.status(200).json({ ...notebook.toObject(), noteCount });
    } catch (error) {
        console.log("Error in updateNotebook", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// DELETE /api/notebooks/:id
export async function deleteNotebook(req, res) {
    try {
        const { id } = req.params;

        const notebook = await Notebook.findOne({ _id: id, userId: req.user._id });
        if (!notebook) return res.status(404).json({ error: "Notebook not found" });

        // Unassign all notes from this notebook (don't delete the notes)
        await Note.updateMany(
            { userId: req.user._id, notebookId: id },
            { $set: { notebookId: null } }
        );

        await Notebook.findByIdAndDelete(id);
        res.status(200).json({ message: "Notebook deleted" });
    } catch (error) {
        console.log("Error in deleteNotebook", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
