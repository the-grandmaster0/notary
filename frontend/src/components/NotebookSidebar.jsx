import { useState } from "react";
import { createPortal } from "react-dom";
import {
    MdAdd, MdEdit, MdDelete, MdCheck, MdClose, MdBookmarkBorder,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import { useNotebookContext } from "../context/NotebookContext";
import ConfirmModal from "./ConfirmModal";

const NB_COLORS = [
    { id: "default", cls: "bg-theme-text-dim" },
    { id: "red",     cls: "bg-red-400" },
    { id: "orange",  cls: "bg-orange-400" },
    { id: "yellow",  cls: "bg-yellow-400" },
    { id: "green",   cls: "bg-green-400" },
    { id: "blue",    cls: "bg-blue-400" },
    { id: "purple",  cls: "bg-purple-400" },
    { id: "pink",    cls: "bg-pink-400" },
];

function getDotClass(colorId) {
    return NB_COLORS.find(c => c.id === colorId)?.cls || "bg-theme-text-dim";
}

const NotebookForm = ({ initial = { name: "", color: "default" }, onSave, onCancel, label = "Create" }) => {
    const [name, setName] = useState(initial.name);
    const [color, setColor] = useState(initial.color);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), color });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 py-2 flex flex-col gap-2">
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Notebook name…"
                autoFocus
                maxLength={40}
                className="w-full bg-theme-bg border border-theme-border rounded px-2 py-1.5 text-theme-text text-xs focus:border-white focus:outline-none transition-colors"
            />
            <div className="flex gap-1.5 flex-wrap">
                {NB_COLORS.map(c => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`w-4 h-4 rounded-full ${c.cls} transition-transform ${
                            color === c.id ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                        }`}
                    />
                ))}
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-theme-text text-theme-bg font-semibold hover:opacity-90 transition-opacity"
                >
                    <MdCheck size={13} /> {label}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs px-2 py-1 rounded text-theme-text-dim hover:text-theme-text transition-colors"
                >
                    <MdClose size={13} />
                </button>
            </div>
        </form>
    );
};

const NotebookSidebar = ({ activeNotebookId, onSelect }) => {
    const { notebooks, setNotebooks } = useNotebookContext();
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: "" });

    const handleCreate = async ({ name, color }) => {
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, color }),
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setNotebooks(prev => [...prev, data]);
                setCreating(false);
                toast.success(`Notebook "${name}" created`);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to create notebook");
        }
    };

    const handleUpdate = async (id, { name, color }) => {
        try {
            const res = await fetch(`/api/notebooks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, color }),
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setNotebooks(prev => prev.map(nb => nb._id === id ? data : nb));
                setEditingId(null);
                toast.success("Notebook updated");
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to update notebook");
        }
    };

    const handleDelete = async () => {
        const { id, name } = confirmDelete;
        setConfirmDelete({ open: false, id: null, name: "" });
        try {
            const res = await fetch(`/api/notebooks/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setNotebooks(prev => prev.filter(nb => nb._id !== id));
                if (activeNotebookId === id) onSelect(null);
                toast.success(`Notebook "${name}" deleted`);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to delete notebook");
        }
    };

    return (
        <aside className="w-56 shrink-0 flex flex-col gap-1">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-theme-text-dim uppercase tracking-wider">
                    Notebooks
                </span>
                <button
                    onClick={() => { setCreating(true); setEditingId(null); }}
                    className="p-1 rounded hover:bg-theme-surface text-theme-text-dim hover:text-theme-text transition-colors"
                    title="New notebook"
                    aria-label="Create new notebook"
                >
                    <MdAdd size={16} />
                </button>
            </div>

            {/* Create form */}
            {creating && (
                <div className="bg-theme-surface border border-theme-border rounded-md mx-2 mb-1">
                    <NotebookForm
                        onSave={handleCreate}
                        onCancel={() => setCreating(false)}
                        label="Create"
                    />
                </div>
            )}

            {/* All Notes */}
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md mx-2 text-sm transition-colors ${
                    activeNotebookId === null
                        ? "bg-theme-surface text-theme-text font-medium"
                        : "text-theme-text-dim hover:text-theme-text hover:bg-theme-surface/50"
                }`}
            >
                <MdBookmarkBorder size={16} className="shrink-0" />
                <span className="truncate">All Notes</span>
            </button>

            {/* Notebook list */}
            {notebooks.map(nb => (
                <div key={nb._id} className="mx-2">
                    {editingId === nb._id ? (
                        <div className="bg-theme-surface border border-theme-border rounded-md mb-1">
                            <NotebookForm
                                initial={{ name: nb.name, color: nb.color }}
                                onSave={(data) => handleUpdate(nb._id, data)}
                                onCancel={() => setEditingId(null)}
                                label="Save"
                            />
                        </div>
                    ) : (
                        <div className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            activeNotebookId === nb._id
                                ? "bg-theme-surface text-theme-text"
                                : "text-theme-text-dim hover:text-theme-text hover:bg-theme-surface/50"
                        }`}>
                            <button
                                onClick={() => onSelect(nb._id)}
                                className="flex items-center gap-2 flex-1 min-w-0"
                            >
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDotClass(nb.color)}`} />
                                <span className="truncate text-sm">{nb.name}</span>
                                <span className="text-xs text-theme-text-dim/60 ml-auto shrink-0">
                                    {nb.noteCount ?? ""}
                                </span>
                            </button>
                            {/* Hover actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingId(nb._id); setCreating(false); }}
                                    className="p-0.5 hover:text-theme-text transition-colors"
                                    title="Rename"
                                    aria-label={`Rename ${nb.name}`}
                                >
                                    <MdEdit size={13} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: nb._id, name: nb.name }); }}
                                    className="p-0.5 hover:text-red-400 transition-colors"
                                    title="Delete notebook"
                                    aria-label={`Delete ${nb.name}`}
                                >
                                    <MdDelete size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Empty state */}
            {notebooks.length === 0 && !creating && (
                <button
                    onClick={() => setCreating(true)}
                    className="mx-3 mt-1 text-xs text-theme-text-dim hover:text-theme-text border border-dashed border-theme-border hover:border-theme-text rounded-md py-2 px-3 transition-colors flex items-center gap-1.5 w-[calc(100%-1.5rem)]"
                >
                    <MdAdd size={14} /> New notebook
                </button>
            )}

            {/* Delete confirm */}
            {createPortal(
                <ConfirmModal
                    isOpen={confirmDelete.open}
                    title="Delete Notebook?"
                    message={`"${confirmDelete.name}" will be deleted. Notes inside will remain but won't be in any notebook.`}
                    confirmLabel="Delete"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDelete({ open: false, id: null, name: "" })}
                />,
                document.body
            )}
        </aside>
    );
};

export default NotebookSidebar;
