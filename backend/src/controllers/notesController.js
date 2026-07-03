import Note from '../models/Note.js';

// GET /api/notes — fetch all non-deleted notes, with optional search, tag & notebook filter
export async function getAllNotes(req, res) {
    try {
        const { search, tag, notebookId } = req.query;
        const query = { userId: req.user._id, deletedAt: null };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ];
        }

        if (tag) query.tags = tag;

        if (notebookId === "none") {
            query.notebookId = null; // unfiled notes
        } else if (notebookId) {
            query.notebookId = notebookId;
        }

        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.log("Error in getAllNotes controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /api/notes/trash — fetch soft-deleted notes
export async function getTrashedNotes(req, res) {
    try {
        const notes = await Note.find({
            userId: req.user._id,
            deletedAt: { $ne: null }
        }).sort({ deletedAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.log("Error in getTrashedNotes controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PUT /api/notes/:id/star
export async function toggleStar(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOne({ _id: id, userId: req.user._id, deletedAt: null });

        if (!note) return res.status(404).json({ error: "Note not found" });

        note.isStarred = !note.isStarred;
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        console.log("Error in toggleStar controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// POST /api/notes
export async function createNote(req, res) {
    try {
        const { title, content, tags, color, notebookId } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Please provide both title and content" });
        }

        const newNote = new Note({
            userId: req.user._id,
            title,
            content,
            tags: tags || [],
            color: color || "default",
            notebookId: notebookId || null,
        });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        console.log("Error in createNote controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PUT /api/notes/:id
export async function updateNote(req, res) {
    try {
        const { id } = req.params;
        const { title, content, tags, color, notebookId } = req.body;

        const note = await Note.findOne({ _id: id, userId: req.user._id, deletedAt: null });
        if (!note) return res.status(404).json({ error: "Note not found" });

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (tags !== undefined) note.tags = tags;
        if (color !== undefined) note.color = color;
        if (notebookId !== undefined) note.notebookId = notebookId || null;

        await note.save();
        res.status(200).json(note);
    } catch (error) {
        console.log("Error in updateNote controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// DELETE /api/notes/:id — soft delete (move to trash)
export async function deleteNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOne({ _id: id, userId: req.user._id, deletedAt: null });

        if (!note) return res.status(404).json({ error: "Note not found" });

        note.deletedAt = new Date();
        await note.save();
        res.status(200).json({ message: "Note moved to trash" });
    } catch (error) {
        console.log("Error in deleteNote controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// PUT /api/notes/:id/restore — restore from trash
export async function restoreNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOne({ _id: id, userId: req.user._id, deletedAt: { $ne: null } });

        if (!note) return res.status(404).json({ error: "Note not found in trash" });

        note.deletedAt = null;
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        console.log("Error in restoreNote controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// DELETE /api/notes/:id/permanent — permanently delete from trash
export async function permanentDeleteNote(req, res) {
    try {
        const { id } = req.params;
        const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id, deletedAt: { $ne: null } });

        if (!note) return res.status(404).json({ error: "Note not found in trash" });

        res.status(200).json({ message: "Note permanently deleted" });
    } catch (error) {
        console.log("Error in permanentDeleteNote controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// GET /api/notes/tags — get all unique tags for the current user
export async function getUserTags(req, res) {
    try {
        const notes = await Note.find({ userId: req.user._id, deletedAt: null }).select("tags");
        const allTags = notes.flatMap(n => n.tags);
        const uniqueTags = [...new Set(allTags)];
        res.status(200).json(uniqueTags);
    } catch (error) {
        console.log("Error in getUserTags controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
