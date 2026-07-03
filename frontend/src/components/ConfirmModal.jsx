import { createPortal } from "react-dom";
import { MdWarning } from "react-icons/md";

const ConfirmModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title = "Are you sure?",
    message,
    confirmLabel = "Delete",
    danger = true,
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-theme-surface border border-theme-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${danger ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                        <MdWarning size={24} className={danger ? "text-red-500" : "text-yellow-400"} />
                    </div>
                    <h3 className="text-lg font-bold text-theme-text">{title}</h3>
                </div>
                <p className="text-theme-text-dim text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md text-theme-text-dim hover:text-theme-text hover:bg-theme-bg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-md text-white font-semibold text-sm transition-opacity hover:opacity-90 ${
                            danger ? "bg-red-500" : "bg-yellow-500"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
