import mongoose from "mongoose";

const notebookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        default: "default",
    },
}, { timestamps: true });

const Notebook = mongoose.model("Notebook", notebookSchema);

export default Notebook;
