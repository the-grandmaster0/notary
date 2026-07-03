import { MdDelete, MdEdit, MdStar, MdStarBorder, MdDownload, MdBook } from "react-icons/md";
import { getTagColor, getNoteColor } from "../constants/tags";

const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const NB_COLORS = {
    default: "bg-theme-text-dim",
    red: "bg-red-400", orange: "bg-orange-400", yellow: "bg-yellow-400",
    green: "bg-green-400", blue: "bg-blue-400", purple: "bg-purple-400", pink: "bg-pink-400",
};

const NoteCard = ({ note, onDelete, onEdit, onStar, onExport, notebook }) => {
    const colorStyle = getNoteColor(note.color);
    const plainContent = stripHtml(note.content);

    return (
        <div className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-5 hover:border-theme-text-dim transition-colors duration-200 relative flex flex-col`}>
            {/* Star */}
            <button
                onClick={() => onStar(note)}
                className={`absolute top-4 right-4 transition-colors p-1 ${
                    note.isStarred ? "text-yellow-400" : "text-theme-text-dim hover:text-yellow-400"
                }`}
                title={note.isStarred ? "Unstar" : "Star"}
                aria-label={note.isStarred ? "Unstar note" : "Star note"}
            >
                {note.isStarred ? <MdStar size={20} /> : <MdStarBorder size={20} />}
            </button>

            {/* Notebook badge */}
            {notebook && (
                <div className="flex items-center gap-1 mb-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${NB_COLORS[notebook.color] || NB_COLORS.default}`} />
                    <span className="text-xs text-theme-text-dim truncate">{notebook.name}</span>
                </div>
            )}

            {/* Title */}
            <h2 className="text-lg font-semibold text-theme-text mb-2 truncate pr-8">
                {note.title}
            </h2>

            {/* Tags */}
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

            {/* Content preview */}
            <p className="text-theme-text-dim text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                {plainContent || <span className="italic opacity-50">No content</span>}
            </p>

            {/* Date */}
            <p className="text-xs text-theme-text-dim/60 mb-3">
                {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-theme-border/50">
                {onExport && (
                    <button onClick={() => onExport(note)} className="text-theme-text-dim hover:text-theme-text transition-colors p-1" title="Export as PDF" aria-label="Export note as PDF">
                        <MdDownload size={18} />
                    </button>
                )}
                <button onClick={() => onEdit(note)} className="text-theme-text-dim hover:text-theme-text transition-colors p-1" title="Edit" aria-label="Edit note">
                    <MdEdit size={18} />
                </button>
                <button onClick={() => onDelete(note._id)} className="text-theme-text-dim hover:text-red-500 transition-colors p-1" title="Move to trash" aria-label="Move note to trash">
                    <MdDelete size={18} />
                </button>
            </div>
        </div>
    );
};

export default NoteCard;
