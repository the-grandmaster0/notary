import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import NoteCard from "../components/NoteCard";
import Navbar from "../components/Navbar";
import RichEditor from "../components/RichEditor";
import TagInput from "../components/TagInput";
import ConfirmModal from "../components/ConfirmModal";
import NotebookSidebar from "../components/NotebookSidebar";
import { toast } from "react-hot-toast";
import {
    MdAdd, MdSearch, MdClose, MdFilterList, MdDeleteOutline,
    MdOutlineSaveAlt, MdMenuBook,
} from "react-icons/md";
import { NOTE_COLORS, getTagColor } from "../constants/tags";
import { useDraft } from "../hooks/useDraft";
import { useNotebookContext } from "../context/NotebookContext";
import jsPDF from "jspdf";

const EMPTY_NOTE = { title: "", content: "", tags: [], color: "default", notebookId: null };

// Keyboard shortcut hook — uses ref so callback is never stale
function useShortcut(key, callback) {
    const cbRef = useRef(callback);
    useEffect(() => { cbRef.current = callback; });
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === key) {
                e.preventDefault();
                cbRef.current();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [key]);
}

const Home = () => {
    const [notes, setNotes] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const { notebooks, setNotebooks, fetchNotebooks } = useNotebookContext();
    const [activeNotebookId, setActiveNotebookId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState(EMPTY_NOTE);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTag, setActiveTag] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, noteId: null });
    const [hasDraft, setHasDraft] = useState(false);
    const searchRef = useRef(null);
    const { saveDraft, loadDraft, clearDraft } = useDraft();

    // Read URL params — support ?notebook= from mobile menu and ?type=starred
    const [searchParams, setSearchParams] = useSearchParams();
    const showStarredOnly = searchParams.get("type") === "starred";
    const notebookParam = searchParams.get("notebook");

    // Consume ?notebook= param once, then remove it from URL
    useEffect(() => {
        if (notebookParam) {
            setActiveNotebookId(notebookParam);
            setSearchParams(prev => { prev.delete("notebook"); return prev; }, { replace: true });
        }
    }, [notebookParam, setSearchParams]);

    // Keyboard shortcuts
    useShortcut("n", () => openModal());
    useShortcut("f", () => searchRef.current?.focus());

    // Check for saved draft on mount
    useEffect(() => {
        const draft = loadDraft();
        if (draft && !draft._id) setHasDraft(true);
    }, [loadDraft]);

    const fetchNotes = useCallback(async (q, t, nb) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (q) params.set("search", q);
            if (t) params.set("tag", t);
            if (nb) params.set("notebookId", nb);
            const res = await fetch(`/api/notes?${params}`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) setNotes(data);
            else if (res.status !== 401) toast.error(data.error || "Failed to fetch notes");
        } catch {
            toast.error("Could not reach the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTags = useCallback(async () => {
        try {
            const res = await fetch("/api/notes/tags", { credentials: "include" });
            if (res.ok) setAllTags(await res.json());
        } catch { /* silent */ }
    }, []);

    // Initial load
    useEffect(() => {
        fetchNotes(searchQuery, activeTag, activeNotebookId);
        fetchTags();
        fetchNotebooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced re-fetch whenever filters change
    useEffect(() => {
        const t = setTimeout(() => fetchNotes(searchQuery, activeTag, activeNotebookId), 300);
        return () => clearTimeout(t);
    }, [searchQuery, activeTag, activeNotebookId, fetchNotes]);

    const handleNotebookSelect = (id) => {
        setActiveNotebookId(id);
        setActiveTag(null);
        setSearchQuery("");
    };

    const openModal = (note = null) => {
        if (note) {
            setIsEditing(true);
            setCurrentNote({
                _id: note._id,
                title: note.title,
                content: note.content,
                tags: note.tags || [],
                color: note.color || "default",
                notebookId: note.notebookId || null,
            });
        } else {
            setIsEditing(false);
            const draft = loadDraft();
            setCurrentNote(draft && !draft._id ? draft : { ...EMPTY_NOTE, notebookId: activeNotebookId });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentNote(EMPTY_NOTE);
        setIsEditing(false);
    };

    // Auto-save draft while typing (new notes only)
    useEffect(() => {
        if (!isModalOpen || isEditing) return;
        if (!currentNote.title && !currentNote.content) return;
        const t = setTimeout(() => saveDraft(currentNote), 500);
        return () => clearTimeout(t);
    }, [currentNote, isModalOpen, isEditing, saveDraft]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentNote.title.trim() || !currentNote.content || currentNote.content === "<p></p>") {
            toast.error("Title and content are required");
            return;
        }
        try {
            const url = isEditing ? `/api/notes/${currentNote._id}` : "/api/notes";
            const method = isEditing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: currentNote.title,
                    content: currentNote.content,
                    tags: currentNote.tags,
                    color: currentNote.color,
                    notebookId: currentNote.notebookId || null,
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(isEditing ? "Note updated" : "Note created");
                closeModal();
                clearDraft();
                setHasDraft(false);
                fetchNotes(searchQuery, activeTag, activeNotebookId);
                fetchTags();
                fetchNotebooks();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Operation failed");
        }
    };

    const handleDeleteRequest = (id) => setConfirmDelete({ open: true, noteId: id });

    const handleDeleteConfirm = async () => {
        const id = confirmDelete.noteId;
        setConfirmDelete({ open: false, noteId: null });
        try {
            const res = await fetch(`/api/notes/${id}`, { method: "DELETE", credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setNotes(prev => prev.filter(n => n._id !== id));
                toast.success("Note moved to trash");
                fetchTags();
                fetchNotebooks();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Error deleting note");
        }
    };

    const handleStarNote = async (note) => {
        try {
            const res = await fetch(`/api/notes/${note._id}/star`, { method: "PUT", credentials: "include" });
            const updated = await res.json();
            if (res.ok) {
                setNotes(prev => prev.map(n => n._id === note._id ? updated : n));
                toast.success(updated.isStarred ? "Note starred" : "Note unstarred");
            } else {
                toast.error(updated.error);
            }
        } catch {
            toast.error("Failed to update star status");
        }
    };

    const handleExport = (note) => {
        const doc = new jsPDF();
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(note.title, margin, 20);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120);
        doc.text(new Date(note.updatedAt).toLocaleDateString(), margin, 28);
        doc.setTextColor(0);
        let y = 36;
        if (note.tags?.length > 0) {
            doc.setFontSize(9);
            doc.text(`Tags: ${note.tags.map(t => `#${t}`).join(" ")}`, margin, y);
            y += 8;
        }
        const tmp = document.createElement("div");
        tmp.innerHTML = note.content;
        const plainText = tmp.textContent || tmp.innerText || "";
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(plainText, pageWidth);
        doc.text(lines, margin, y + 4);
        doc.save(`${note.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
        toast.success("Note exported as PDF");
    };

    const filteredNotes = showStarredOnly ? notes.filter(n => n.isStarred) : notes;
    const sortedNotes = [...filteredNotes].sort((a, b) => Number(b.isStarred) - Number(a.isStarred));
    const activeNotebook = notebooks.find(nb => nb._id === activeNotebookId);
    const pageTitle = showStarredOnly ? "Starred Notes"
        : activeNotebook ? activeNotebook.name
        : activeTag ? `#${activeTag}`
        : "All Notes";

    return (
        <div className="min-h-screen bg-theme-bg pb-16">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-24 flex gap-6">
                {/* Notebook Sidebar — md+ only */}
                {sidebarOpen && (
                    <div className="hidden md:block">
                        <NotebookSidebar
                            activeNotebookId={activeNotebookId}
                            onSelect={handleNotebookSelect}
                        />
                    </div>
                )}

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(p => !p)}
                                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-theme-border text-theme-text-dim hover:text-theme-text hover:border-theme-text transition-colors text-xs"
                                title={sidebarOpen ? "Hide notebooks" : "Show notebooks"}
                            >
                                <MdMenuBook size={16} />
                                <span>{sidebarOpen ? "Hide" : "Notebooks"}</span>
                            </button>
                            <h2 className="text-2xl font-semibold text-theme-text">{pageTitle}</h2>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-56">
                                <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-dim pointer-events-none" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search… (Ctrl+F)"
                                    className="w-full pl-8 pr-7 py-2 bg-theme-surface border border-theme-border rounded-md text-theme-text text-sm placeholder-theme-text-dim focus:outline-none focus:border-white transition-colors"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-text-dim hover:text-theme-text">
                                        <MdClose size={14} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="relative px-4 py-2 rounded-md bg-theme-text text-theme-bg font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm whitespace-nowrap"
                                title="New note (Ctrl+N)"
                            >
                                <MdAdd size={18} /> Create Note
                                {hasDraft && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-theme-bg" title="Unsaved draft" />
                                )}
                            </button>
                            <Link
                                to="/trash"
                                className="px-3 py-2 rounded-md border border-theme-border text-theme-text-dim hover:text-theme-text hover:border-theme-text transition-colors"
                                title="Trash"
                            >
                                <MdDeleteOutline size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Mobile notebook pills */}
                    <div className="flex md:hidden gap-2 overflow-x-auto pb-1 mb-4">
                        <button
                            onClick={() => handleNotebookSelect(null)}
                            className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                                !activeNotebookId ? "bg-theme-text text-theme-bg border-theme-text" : "border-theme-border text-theme-text-dim"
                            }`}
                        >
                            All
                        </button>
                        {notebooks.map(nb => (
                            <button
                                key={nb._id}
                                onClick={() => handleNotebookSelect(nb._id)}
                                className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                                    activeNotebookId === nb._id ? "bg-theme-text text-theme-bg border-theme-text" : "border-theme-border text-theme-text-dim"
                                }`}
                            >
                                {nb.name}
                            </button>
                        ))}
                    </div>

                    {/* Tag filter bar */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5 items-center">
                            <MdFilterList size={15} className="text-theme-text-dim" />
                            <button
                                onClick={() => setActiveTag(null)}
                                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                    !activeTag ? "bg-theme-text text-theme-bg border-theme-text" : "border-theme-border text-theme-text-dim hover:border-theme-text"
                                }`}
                            >
                                All tags
                            </button>
                            {allTags.map(tag => {
                                const c = getTagColor(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                        className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${c.bg} ${c.text} ${
                                            activeTag === tag ? `${c.border} ring-1 ring-current` : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        #{tag}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Notes grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="text-theme-text-dim animate-pulse">Loading...</span>
                        </div>
                    ) : sortedNotes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {sortedNotes.map(note => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    notebook={notebooks.find(nb => nb._id === (note.notebookId?._id ?? note.notebookId))}
                                    onDelete={handleDeleteRequest}
                                    onEdit={openModal}
                                    onStar={handleStarNote}
                                    onExport={handleExport}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 border border-dashed border-theme-border rounded-lg">
                            <p className="text-theme-text-dim text-sm">
                                {searchQuery ? `No notes match "${searchQuery}"`
                                    : showStarredOnly ? "No starred notes."
                                    : activeNotebook ? `No notes in "${activeNotebook.name}" yet.`
                                    : activeTag ? `No notes tagged #${activeTag}`
                                    : "No notes yet. Create one to get started."}
                            </p>
                            {!searchQuery && !showStarredOnly && (
                                <button onClick={() => openModal()} className="mt-4 px-5 py-2 rounded-md bg-theme-text text-theme-bg text-sm font-semibold hover:opacity-90 transition-opacity">
                                    + Create your first note
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm delete modal */}
            <ConfirmModal
                isOpen={confirmDelete.open}
                title="Move to Trash?"
                message="This note will be moved to the trash. You can restore it from there."
                confirmLabel="Move to Trash"
                danger
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ open: false, noteId: null })}
            />

            {/* Create / Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-theme-surface border border-theme-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-theme-border shrink-0">
                            <h3 className="text-lg font-bold text-theme-text">
                                {isEditing ? "Edit Note" : "Create Note"}
                            </h3>
                            <button onClick={closeModal} className="text-theme-text-dim hover:text-theme-text transition-colors" aria-label="Close">
                                <MdClose size={22} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-xs font-medium text-theme-text-dim mb-1.5">Title *</label>
                                <input
                                    type="text"
                                    className="w-full bg-theme-bg border border-theme-border rounded-md px-3 py-2 text-theme-text focus:border-white focus:outline-none transition-colors text-sm"
                                    value={currentNote.title}
                                    onChange={e => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    placeholder="Note title..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-theme-text-dim mb-1.5">Notebook</label>
                                <select
                                    value={currentNote.notebookId || ""}
                                    onChange={e => setCurrentNote(prev => ({ ...prev, notebookId: e.target.value || null }))}
                                    className="w-full bg-theme-bg border border-theme-border rounded-md px-3 py-2 text-theme-text text-sm focus:border-white focus:outline-none transition-colors"
                                >
                                    <option value="">— No notebook —</option>
                                    {notebooks.map(nb => (
                                        <option key={nb._id} value={nb._id}>{nb.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-theme-text-dim mb-1.5">Content *</label>
                                <RichEditor
                                    content={currentNote.content}
                                    onChange={val => setCurrentNote(prev => ({ ...prev, content: val }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-theme-text-dim mb-1.5">Tags</label>
                                <TagInput
                                    tags={currentNote.tags}
                                    onChange={tags => setCurrentNote(prev => ({ ...prev, tags }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-theme-text-dim mb-1.5">Card Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {NOTE_COLORS.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setCurrentNote(prev => ({ ...prev, color: c.id }))}
                                            title={c.label}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${c.bg} ${
                                                currentNote.color === c.id ? "border-white scale-110" : "border-transparent hover:border-theme-text-dim"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="flex justify-between items-center px-6 py-4 border-t border-theme-border shrink-0">
                            <div>
                                {!isEditing && hasDraft && (
                                    <button
                                        type="button"
                                        onClick={() => { clearDraft(); setHasDraft(false); setCurrentNote({ ...EMPTY_NOTE, notebookId: activeNotebookId }); }}
                                        className="text-xs text-theme-text-dim hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        <MdOutlineSaveAlt size={13} /> Discard draft
                                    </button>
                                )}
                                {!isEditing && !hasDraft && currentNote.title && (
                                    <span className="text-xs text-theme-text-dim/60 flex items-center gap-1">
                                        <MdOutlineSaveAlt size={13} /> Auto-saving…
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md text-theme-text-dim hover:text-theme-text hover:bg-theme-bg transition-colors text-sm">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-5 py-2 rounded-md bg-theme-text text-theme-bg font-semibold hover:opacity-90 transition-opacity text-sm">
                                    {isEditing ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Home;
