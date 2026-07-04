import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { MdClose, MdCloudUpload, MdDeleteOutline, MdPersonOff, MdEdit, MdCheck } from "react-icons/md";
import ConfirmModal from "./ConfirmModal";

const DEFAULT_AVATAR =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-template_719432-2210.jpg?w=740";

const ProfileModal = ({ isOpen, onClose }) => {
    const { authUser, setAuthUser } = useAuthContext();

    // Profile pic state
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [picLoading, setPicLoading] = useState(false);
    const [removing, setRemoving] = useState(false);

    // Username state
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [usernameLoading, setUsernameLoading] = useState(false);

    // Delete account state
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Reset state every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setPreview(authUser?.profilePic || "");
            setEditingUsername(false);
            setNewUsername(authUser?.username || "");
        }
    }, [isOpen, authUser?.profilePic, authUser?.username]);

    // ── Profile picture handlers ──────────────────────────────────────────────

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handlePicSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setPicLoading(true);
        const formData = new FormData();
        formData.append("profilePic", file);

        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                body: formData,
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setAuthUser(data);
                localStorage.setItem("notary-user", JSON.stringify(data));
                toast.success("Profile picture updated");
                setFile(null);
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setPicLoading(false);
        }
    };

    const handleRemovePic = async () => {
        setRemoving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setAuthUser(data);
                localStorage.setItem("notary-user", JSON.stringify(data));
                toast.success("Profile picture removed");
                setPreview("");
                setFile(null);
            } else {
                toast.error(data.error || "Failed to remove profile picture");
            }
        } catch {
            toast.error("Failed to remove profile picture");
        } finally {
            setRemoving(false);
        }
    };

    // ── Username handler ──────────────────────────────────────────────────────

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        const trimmed = newUsername.trim();

        if (trimmed === authUser?.username) {
            setEditingUsername(false);
            return;
        }
        if (trimmed.length < 4) {
            toast.error("Username must be at least 4 characters");
            return;
        }
        if (!/^[a-zA-Z0-9]/.test(trimmed)) {
            toast.error("Username must start with a letter or number");
            return;
        }

        setUsernameLoading(true);
        try {
            const res = await fetch("/api/auth/username", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: trimmed }),
            });
            const data = await res.json();
            if (res.ok) {
                setAuthUser(data);
                localStorage.setItem("notary-user", JSON.stringify(data));
                toast.success("Username updated");
                setEditingUsername(false);
            } else {
                toast.error(data.error || "Failed to update username");
            }
        } catch {
            toast.error("Failed to update username");
        } finally {
            setUsernameLoading(false);
        }
    };

    // ── Delete account handler ────────────────────────────────────────────────

    const handleDeleteAccount = async () => {
        setConfirmDeleteAccount(false);
        setDeletingAccount(true);
        try {
            const res = await fetch("/api/auth/account", {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Account deleted");
                localStorage.removeItem("notary-user");
                setAuthUser(null);
                onClose();
            } else {
                toast.error(data.error || "Failed to delete account");
            }
        } catch {
            toast.error("Failed to delete account");
        } finally {
            setDeletingAccount(false);
        }
    };

    const hasExistingPic = !!authUser?.profilePic;
    const busy = picLoading || removing || usernameLoading || deletingAccount;

    return (
        <>
            {isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-theme-surface border border-theme-border p-6 rounded-xl w-full max-w-sm shadow-2xl relative mx-4 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-theme-text-dim hover:text-theme-text"
                            aria-label="Close modal"
                        >
                            <MdClose size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-theme-text mb-6">Profile</h3>

                        {/* ── Username section ── */}
                        <div className="mb-5">
                            <p className="text-xs font-semibold text-theme-text-dim uppercase tracking-wider mb-2">Username</p>
                            {editingUsername ? (
                                <form onSubmit={handleUsernameSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        autoFocus
                                        maxLength={30}
                                        className="flex-1 bg-theme-bg border border-theme-border rounded-md px-3 py-2 text-theme-text text-sm focus:border-white focus:outline-none transition-colors"
                                        placeholder="New username…"
                                    />
                                    <button
                                        type="submit"
                                        disabled={usernameLoading || !newUsername.trim()}
                                        className="px-3 py-2 rounded-md bg-theme-text text-theme-bg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1"
                                    >
                                        <MdCheck size={15} />
                                        {usernameLoading ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setEditingUsername(false); setNewUsername(authUser?.username || ""); }}
                                        className="px-2 py-2 rounded-md text-theme-text-dim hover:text-theme-text transition-colors"
                                        aria-label="Cancel"
                                    >
                                        <MdClose size={16} />
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center justify-between bg-theme-bg border border-theme-border rounded-md px-3 py-2">
                                    <span className="text-sm text-theme-text font-medium">{authUser?.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingUsername(true)}
                                        className="text-theme-text-dim hover:text-theme-text transition-colors ml-2 shrink-0"
                                        title="Change username"
                                        aria-label="Change username"
                                    >
                                        <MdEdit size={16} />
                                    </button>
                                </div>
                            )}
                            <p className="text-xs text-theme-text-dim/60 mt-1">Min 4 characters, must start with a letter or number.</p>
                        </div>

                        {/* ── Profile picture section ── */}
                        <p className="text-xs font-semibold text-theme-text-dim uppercase tracking-wider mb-3">Profile Picture</p>

                        <form onSubmit={handlePicSubmit} className="flex flex-col items-center">
                            {/* Avatar preview */}
                            <div className="relative w-28 h-28 mb-3 group cursor-pointer overflow-hidden rounded-full border-2 border-theme-border">
                                <img
                                    src={preview || DEFAULT_AVATAR}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1">
                                    <MdCloudUpload className="text-white" size={26} />
                                    <span className="text-white text-xs">Change</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </label>
                            </div>

                            <p className="text-theme-text-dim text-xs mb-4 text-center">
                                {file ? file.name : "Hover the image to change it"}
                            </p>

                            <button
                                type="submit"
                                className="w-full py-2 rounded-md bg-theme-text text-theme-bg font-bold hover:opacity-90 transition-opacity disabled:opacity-40 mb-2"
                                disabled={busy || !file}
                            >
                                {picLoading ? "Uploading..." : "Save Picture"}
                            </button>

                            {hasExistingPic && (
                                <button
                                    type="button"
                                    onClick={handleRemovePic}
                                    disabled={busy}
                                    className="w-full py-2 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2 mb-2"
                                >
                                    <MdDeleteOutline size={17} />
                                    {removing ? "Removing..." : "Remove Profile Picture"}
                                </button>
                            )}

                            {/* Delete account */}
                            <div className="w-full border-t border-theme-border mt-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteAccount(true)}
                                    disabled={busy}
                                    className="w-full py-2 rounded-md border border-red-700/50 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    <MdPersonOff size={17} />
                                    {deletingAccount ? "Deleting account..." : "Delete Account"}
                                </button>
                                <p className="text-xs text-theme-text-dim/60 text-center mt-1.5">
                                    Permanently deletes your account and all your notes.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={confirmDeleteAccount}
                title="Delete Account?"
                message="This will permanently delete your account, all your notes, and all your notebooks. This cannot be undone."
                confirmLabel="Delete My Account"
                danger
                onConfirm={handleDeleteAccount}
                onCancel={() => setConfirmDeleteAccount(false)}
            />
        </>
    );
};

export default ProfileModal;
