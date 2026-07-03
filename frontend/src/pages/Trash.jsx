import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-hot-toast";
import { MdRestore, MdDeleteForever, MdArrowBack, MdDeleteOutline } from "react-icons/md";
import { getNoteColor, getTagColor } from "../constants/tags";

const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const Trash = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmPermanent, setConfirmPermanent] = useState({ open: false, noteId: null });
    const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notes/trash", { credentials: "include" });
            const data = await res.json();
            if (res.ok) setNotes(data);
            else toast.error(data.error || "Failed to load trash");
        } catch {
            toast.error("Could not reach the server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrash(); }, []);

    const handleRestore = async (id) => {
        try {
            const res = await fetch(`/api/notes/${id}/restore`, { method: "PUT", credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setNotes(prev => prev.filter(n => n._id !== id));
                toast.success("Note restored");
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to restore note");
        }
    };

    const handlePermanentDelete = async () => {
        const id = confirmPermanent.noteId;
        setConfirmPermanent({ open: false, noteId: null });
        try {
            const res = await fetch(`/api/notes/${id}/permanent`, { method: "DELETE", credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setNotes(prev => prev.filter(n => n._id !== id));
                toast.success("Note permanently deleted");
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to delete note");
        }
    };

    const handleEmptyTrash = async () => {
        setConfirmEmptyTrash(false);
        try {
            await Promise.all(
                notes.map(n =>
                    fetch(`/api/notes/${n._id}/permanent`, { method: "DELETE", credentials: "include" })
                )
            );
            setNotes([]);
            toast.success("Trash emptied");
        } catch {
            toast.error("Failed to empty trash");
        }
    };

    return (
        <div className="min-h-screen bg-theme-bg pb-16">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-theme-text-dim hover:text-theme-text transition-colors">
                            <MdArrowBack size={22} />
                        </Link>
                        <h2 className="text-2xl font-semibold text-theme-text flex items-center gap-2">
                            <MdDeleteOutline size={26} /> Trash
                            {notes.length > 0 && (
                                <span className="text-sm font-normal text-theme-text-dim">({notes.length} note{notes.length !== 1 ? "s" : ""})</span>
                            )}
                        </h2>
                    </div>
                    {notes.length > 0 && (
                        <button
                            onClick={() => setConfirmEmptyTrash(true)}
                            className="px-3 py-1.5 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm flex items-center gap-1.5"
                        >
                            <MdDeleteForever size={16} /> Empty Trash
                        </button>
                    )}
                </div>

                <p className="text-theme-text-dim text-sm mb-8">
                    Notes in trash are not permanently deleted until you remove them manually.
                </p>

                {loading ? (
                    <div className="flex justify-center h-64 items-center">
                        <span className="text-theme-text-dim animate-pulse">Loading...</span>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-theme-border rounded-lg">
                        <MdDeleteOutline size={48} className="text-theme-text-dim mx-auto mb-3 opacity-30" />
                        <p className="text-theme-text-dim text-sm">Trash is empty</p>
                        <Link to="/" className="mt-4 inline-block px-5 py-2 rounded-md bg-theme-text text-theme-bg text-sm font-semibold hover:opacity-90 transition-opacity">
                            Back to Notes
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {notes.map(note => {
                            const colorStyle = getNoteColor(note.color);
                            const plain = stripHtml(note.content);
                            return (
                                <div key={note._id} className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-5 flex flex-col opacity-80`}>
                                    <h2 className="text-lg font-semibold text-theme-text mb-2 truncate">{note.title}</h2>
                                    {note.tags && note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {note.tags.map(tag => {
                                                const c = getTagColor(tag);
                                                return (
                                                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border}`}>
                                                        #{tag}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <p className="text-theme-text-dim text-sm leading-relaxed mb-4 line-clamp-3 flex-1">{plain || "No content"}</p>
                                    <p className="text-xs text-theme-text-dim/60 mb-3">
                                        Deleted {new Date(note.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                    <div className="flex justify-end gap-2 pt-3 border-t border-theme-border/50">
                                        <button
                                            onClick={() => handleRestore(note._id)}
                                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded border border-green-500/30 hover:border-green-400/50"
                                            title="Restore note"
                                        >
                                            <MdRestore size={15} /> Restore
                                        </button>
                                        <button
                                            onClick={() => setConfirmPermanent({ open: true, noteId: note._id })}
                                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded border border-red-500/30 hover:border-red-400/50"
                                            title="Delete permanently"
                                        >
                                            <MdDeleteForever size={15} /> Delete Forever
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmPermanent.open}
                title="Delete Permanently?"
                message="This action cannot be undone. The note will be gone forever."
                confirmLabel="Delete Forever"
                danger
                onConfirm={handlePermanentDelete}
                onCancel={() => setConfirmPermanent({ open: false, noteId: null })}
            />
            <ConfirmModal
                isOpen={confirmEmptyTrash}
                title="Empty Trash?"
                message={`This will permanently delete all ${notes.length} note${notes.length !== 1 ? "s" : ""} in the trash. This cannot be undone.`}
                confirmLabel="Empty Trash"
                danger
                onConfirm={handleEmptyTrash}
                onCancel={() => setConfirmEmptyTrash(false)}
            />
        </div>
    );
};

export default Trash;
