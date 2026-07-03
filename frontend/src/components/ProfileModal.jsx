import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { MdClose, MdCloudUpload, MdDeleteOutline } from "react-icons/md";

const DEFAULT_AVATAR =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-template_719432-2210.jpg?w=740";

const ProfileModal = ({ isOpen, onClose }) => {
    const { authUser, setAuthUser } = useAuthContext();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState(false);

    // Reset state every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setPreview(authUser?.profilePic || "");
        }
    }, [isOpen, authUser?.profilePic]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
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
                onClose();
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
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
                onClose();
            } else {
                toast.error(data.error || "Failed to remove profile picture");
            }
        } catch {
            toast.error("Failed to remove profile picture");
        } finally {
            setRemoving(false);
        }
    };

    if (!isOpen) return null;

    const hasExistingPic = !!authUser?.profilePic;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-theme-surface border border-theme-border p-6 rounded-xl w-full max-w-sm shadow-2xl relative mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-theme-text-dim hover:text-theme-text"
                    aria-label="Close modal"
                >
                    <MdClose size={24} />
                </button>

                <h3 className="text-xl font-bold text-theme-text mb-6">Profile Picture</h3>

                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    {/* Avatar preview with upload overlay */}
                    <div className="relative w-32 h-32 mb-3 group cursor-pointer overflow-hidden rounded-full border-2 border-theme-border">
                        <img
                            src={preview || DEFAULT_AVATAR}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1">
                            <MdCloudUpload className="text-white" size={28} />
                            <span className="text-white text-xs">Change</span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </label>
                    </div>

                    <p className="text-theme-text-dim text-xs mb-5 text-center">
                        {file ? file.name : "Hover the image to change it"}
                    </p>

                    {/* Upload button */}
                    <button
                        type="submit"
                        className="w-full py-2 rounded-md bg-theme-text text-theme-bg font-bold hover:opacity-90 transition-opacity disabled:opacity-40 mb-3"
                        disabled={loading || removing || !file}
                    >
                        {loading ? "Uploading..." : "Save Changes"}
                    </button>

                    {/* Remove button — only shown when the user has a picture */}
                    {hasExistingPic && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={removing || loading}
                            className="w-full py-2 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            <MdDeleteOutline size={17} />
                            {removing ? "Removing..." : "Remove Profile Picture"}
                        </button>
                    )}
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ProfileModal;
