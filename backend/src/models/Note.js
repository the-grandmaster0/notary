import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    notebookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notebook",
        default: null,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        default: [],
    },
    color: {
        type: String,
        default: "default",
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

// Index for fast search
noteSchema.index({ title: "text", content: "text" });

const Note = mongoose.model("Note", noteSchema);

export default Note;
