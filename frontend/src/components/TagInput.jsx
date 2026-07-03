import { useState } from "react";
import { MdClose } from "react-icons/md";
import { getTagColor } from "../constants/tags";

const TagInput = ({ tags, onChange }) => {
    const [input, setInput] = useState("");

    const addTag = () => {
        const trimmed = input.trim().toLowerCase().replace(/\s+/g, "-");
        if (!trimmed || tags.includes(trimmed)) {
            setInput("");
            return;
        }
        onChange([...tags, trimmed]);
        setInput("");
    };

    const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
        if (e.key === "Backspace" && input === "" && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 p-2 bg-theme-bg border border-theme-border rounded-md focus-within:border-white transition-colors min-h-[42px]">
            {tags.map(tag => {
                const c = getTagColor(tag);
                return (
                    <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:opacity-70 transition-opacity"
                            aria-label={`Remove tag ${tag}`}
                        >
                            <MdClose size={12} />
                        </button>
                    </span>
                );
            })}
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? "Add tags (press Enter or comma)..." : ""}
                className="flex-1 min-w-[120px] bg-transparent text-theme-text text-xs outline-none placeholder-theme-text-dim"
            />
        </div>
    );
};

export default TagInput;
