// Predefined tag colors — tag name gets a deterministic color
export const TAG_COLORS = [
    { name: "red",    bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/40" },
    { name: "orange", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40" },
    { name: "yellow", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/40" },
    { name: "green",  bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/40" },
    { name: "blue",   bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/40" },
    { name: "purple", bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/40" },
    { name: "pink",   bg: "bg-pink-500/20",   text: "text-pink-400",   border: "border-pink-500/40" },
    { name: "gray",   bg: "bg-gray-500/20",   text: "text-gray-400",   border: "border-gray-500/40" },
];

// Deterministically assign a color to a tag based on its text
export function getTagColor(tagName) {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// Note card background colors
export const NOTE_COLORS = [
    { id: "default", label: "Default", bg: "bg-theme-surface",  border: "border-theme-border" },
    { id: "red",     label: "Red",     bg: "bg-red-950/40",     border: "border-red-800/50" },
    { id: "orange",  label: "Orange",  bg: "bg-orange-950/40",  border: "border-orange-800/50" },
    { id: "yellow",  label: "Yellow",  bg: "bg-yellow-950/40",  border: "border-yellow-800/50" },
    { id: "green",   label: "Green",   bg: "bg-green-950/40",   border: "border-green-800/50" },
    { id: "blue",    label: "Blue",    bg: "bg-blue-950/40",    border: "border-blue-800/50" },
    { id: "purple",  label: "Purple",  bg: "bg-purple-950/40",  border: "border-purple-800/50" },
];

export function getNoteColor(colorId) {
    return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
}
