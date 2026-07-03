import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
    MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatStrikethrough,
    MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote,
    MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight,
    MdHighlight, MdCode, MdUndo, MdRedo,
} from "react-icons/md";

const ToolbarBtn = ({ onClick, active, title, children }) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        title={title}
        className={`p-1.5 rounded transition-colors ${
            active
                ? "bg-theme-text text-theme-bg"
                : "text-theme-text-dim hover:text-theme-text hover:bg-theme-bg"
        }`}
    >
        {children}
    </button>
);

const Divider = () => <span className="w-px bg-theme-border mx-1 self-stretch" />;

const RichEditor = ({ content, onChange, placeholder = "Write your thoughts..." }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight.configure({ multicolor: false }),
            TextStyle,
            Placeholder.configure({ placeholder }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "min-h-[160px] outline-none",
            },
        },
    });

    // Sync when editing an existing note
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || "", false);
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="border border-theme-border rounded-md overflow-hidden focus-within:border-white transition-colors">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-theme-border bg-theme-surface">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
                    <MdFormatBold size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
                    <MdFormatItalic size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
                    <MdFormatUnderlined size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                    <MdFormatStrikethrough size={18} />
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
                    <span className="text-xs font-bold px-0.5">H2</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
                    <span className="text-xs font-bold px-0.5">H3</span>
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
                    <MdFormatListBulleted size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
                    <MdFormatListNumbered size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
                    <MdFormatQuote size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
                    <MdCode size={18} />
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
                    <MdFormatAlignLeft size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
                    <MdFormatAlignCenter size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
                    <MdFormatAlignRight size={18} />
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
                    <MdHighlight size={18} />
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo (Ctrl+Z)">
                    <MdUndo size={18} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo (Ctrl+Y)">
                    <MdRedo size={18} />
                </ToolbarBtn>
            </div>
            {/* Editor area */}
            <div className="p-3 bg-theme-bg min-h-[160px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichEditor;
