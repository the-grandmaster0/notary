import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { useNotebookContext } from "../context/NotebookContext";
import useLogout from "../hooks/useLogout";
import {
    MdDarkMode, MdLightMode, MdSettings, MdLogout,
    MdMenu, MdClose, MdStar, MdDeleteOutline,
    MdAdd, MdBook, MdCheck, MdBookmarkBorder, MdPersonOff,
} from "react-icons/md";
import ProfileModal from "./ProfileModal";
import ConfirmModal from "./ConfirmModal";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

const DEFAULT_AVATAR =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-template_719432-2210.jpg?w=740";

const NB_DOT = {
    default: "bg-theme-text-dim", red: "bg-red-400", orange: "bg-orange-400",
    yellow: "bg-yellow-400", green: "bg-green-400", blue: "bg-blue-400",
    purple: "bg-purple-400", pink: "bg-pink-400",
};

const NB_COLORS = [
    { id: "default", cls: "bg-theme-text-dim" }, { id: "red", cls: "bg-red-400" },
    { id: "orange", cls: "bg-orange-400" }, { id: "yellow", cls: "bg-yellow-400" },
    { id: "green", cls: "bg-green-400" }, { id: "blue", cls: "bg-blue-400" },
    { id: "purple", cls: "bg-purple-400" }, { id: "pink", cls: "bg-pink-400" },
];

const Navbar = () => {
    const { authUser } = useAuthContext();
    const { theme, toggleTheme } = useThemeContext();
    const { notebooks, setNotebooks } = useNotebookContext();
    const { logout } = useLogout();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mobile notebook creation state
    const [showNbForm, setShowNbForm] = useState(false);
    const [nbName, setNbName] = useState("");
    const [nbColor, setNbColor] = useState("default");
    const [nbLoading, setNbLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { _id, name }
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
        setShowNbForm(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setShowNbForm(false);
        setNbName("");
        setNbColor("default");
    };

    const handleCreateNotebook = async (e) => {
        e.preventDefault();
        if (!nbName.trim()) return;
        setNbLoading(true);
        try {
            const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nbName.trim(), color: nbColor }),
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) {
                setNotebooks(prev => [...prev, data]);
                toast.success(`Notebook "${data.name}" created`);
                setShowNbForm(false);
                setNbName("");
                setNbColor("default");
                closeMobileMenu();
                navigate("/");
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to create notebook");
        } finally {
            setNbLoading(false);
        }
    };

    const handleDeleteNotebook = async () => {
        const { _id, name } = deleteTarget;
        setDeleteTarget(null);
        try {
            const res = await fetch(`/api/notebooks/${_id}`, { method: "DELETE", credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setNotebooks(prev => prev.filter(nb => nb._id !== _id));
                toast.success(`Notebook "${name}" deleted`);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to delete notebook");
        }
    };

    const handleDeleteAccount = async () => {
        setConfirmDeleteAccount(false);
        try {
            const res = await fetch("/api/auth/account", { method: "DELETE", credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                toast.success("Account deleted");
                localStorage.removeItem("notary-user");
                // Force page reload to clear all state and redirect to landing
                window.location.href = "/";
            } else {
                toast.error(data.error || "Failed to delete account");
            }
        } catch {
            toast.error("Failed to delete account");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('button[aria-label="Toggle Menu"]')
            ) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/" className="text-3xl font-bold text-theme-text tracking-tight hover:opacity-90 transition-opacity">
                        Notary
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-theme-surface text-theme-text transition-colors"
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
                        </button>

                        {authUser ? (
                            <>
                                <Link to="/trash" className="p-2 rounded-full hover:bg-theme-surface text-theme-text-dim hover:text-theme-text transition-colors" title="Trash" aria-label="Go to Trash">
                                    <MdDeleteOutline size={22} />
                                </Link>

                                <div className="relative ml-1" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-9 h-9 rounded-full overflow-hidden border border-theme-border focus:outline-none ring-2 ring-transparent focus:ring-theme-text-dim transition-all"
                                        aria-label="Open profile menu"
                                    >
                                        <img src={authUser.profilePic || DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-theme-surface border border-theme-border rounded-lg shadow-xl py-1 z-50">
                                            <div className="px-4 py-2.5 border-b border-theme-border">
                                                <p className="text-sm font-bold text-theme-text truncate">{authUser.username}</p>
                                                <p className="text-xs text-theme-text-dim truncate">{authUser.email}</p>
                                            </div>
                                            <Link to="/?type=starred" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center gap-2 transition-colors">
                                                <MdStar size={16} className="text-yellow-400" /> Starred Notes
                                            </Link>
                                            <Link to="/trash" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center gap-2 transition-colors">
                                                <MdDeleteOutline size={16} className="text-theme-text-dim" /> Trash
                                            </Link>
                                            <button onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center gap-2 transition-colors">
                                                <MdSettings size={16} /> Profile
                                            </button>
                                            <div className="border-t border-theme-border mt-1 pt-1">
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-theme-bg flex items-center gap-2 transition-colors">
                                                    <MdLogout size={16} /> Logout
                                                </button>
                                                <button
                                                    onClick={() => { setConfirmDeleteAccount(true); setIsDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500/70 hover:bg-theme-bg flex items-center gap-2 transition-colors"
                                                >
                                                    <MdPersonOff size={16} /> Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 ml-2">
                                <Link to="/login" className="text-theme-text hover:text-theme-text-dim font-medium transition-colors text-sm">Login</Link>
                                <Link to="/signup" className="bg-theme-text text-theme-bg px-4 py-2 rounded-md font-bold hover:opacity-90 transition-opacity text-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile top-bar buttons */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-theme-surface text-theme-text transition-colors" aria-label="Toggle theme">
                            {theme === "dark" ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Menu"
                            className="text-theme-text hover:text-theme-text-dim transition-colors p-2"
                        >
                            {isMobileMenuOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Dropdown ── */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="md:hidden bg-theme-bg/95 backdrop-blur-xl border-b border-theme-border shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {authUser ? (
                            <>
                                {/* Profile header */}
                                <div className="flex items-center gap-3 px-3 py-3 border-b border-theme-border/50 mb-2">
                                    <img src={authUser.profilePic || DEFAULT_AVATAR} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-theme-border shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-theme-text truncate">{authUser.username}</p>
                                        <p className="text-xs text-theme-text-dim truncate">{authUser.email}</p>
                                    </div>
                                </div>

                                {/* Nav links */}
                                <Link to="/?type=starred" onClick={closeMobileMenu} className="w-full text-left px-4 py-3 text-theme-text hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors">
                                    <MdStar size={20} className="text-yellow-400" /> Starred Notes
                                </Link>
                                <Link to="/trash" onClick={closeMobileMenu} className="w-full text-left px-4 py-3 text-theme-text hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors">
                                    <MdDeleteOutline size={20} className="text-theme-text-dim" /> Trash
                                </Link>

                                {/* ── Notebooks section ── */}
                                <div className="pt-2 pb-1">
                                    <div className="flex items-center justify-between px-4 py-1.5">
                                        <span className="text-xs font-semibold text-theme-text-dim uppercase tracking-wider">Notebooks</span>
                                        <button
                                            onClick={() => setShowNbForm(p => !p)}
                                            className="flex items-center gap-1 text-xs text-theme-text-dim hover:text-theme-text transition-colors px-2 py-1 rounded hover:bg-theme-surface"
                                        >
                                            {showNbForm ? <MdClose size={14} /> : <MdAdd size={14} />}
                                            {showNbForm ? "Cancel" : "New"}
                                        </button>
                                    </div>

                                    {/* Inline create form */}
                                    {showNbForm && (
                                        <form onSubmit={handleCreateNotebook} className="mx-2 mb-2 bg-theme-surface border border-theme-border rounded-lg p-3 flex flex-col gap-2.5">
                                            <input
                                                type="text"
                                                value={nbName}
                                                onChange={e => setNbName(e.target.value)}
                                                placeholder="Notebook name…"
                                                autoFocus
                                                maxLength={40}
                                                className="w-full bg-theme-bg border border-theme-border rounded px-3 py-2 text-theme-text text-sm focus:border-white focus:outline-none transition-colors"
                                            />
                                            {/* Color picker */}
                                            <div className="flex gap-2 flex-wrap">
                                                {NB_COLORS.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setNbColor(c.id)}
                                                        className={`w-5 h-5 rounded-full ${c.cls} transition-transform ${nbColor === c.id ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"}`}
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={nbLoading || !nbName.trim()}
                                                className="w-full py-2 rounded-md bg-theme-text text-theme-bg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
                                            >
                                                <MdCheck size={15} />
                                                {nbLoading ? "Creating…" : "Create Notebook"}
                                            </button>
                                        </form>
                                    )}

                                    {/* Existing notebooks list */}
                                    {notebooks.length === 0 && !showNbForm ? (
                                        <p className="px-4 py-2 text-xs text-theme-text-dim/50">No notebooks yet — tap New to create one</p>
                                    ) : (
                                        notebooks.map(nb => (
                                            <div key={nb._id} className="flex items-center gap-1 mx-1">
                                                <Link
                                                    to={`/?notebook=${nb._id}`}
                                                    onClick={closeMobileMenu}
                                                    className="flex-1 text-left px-3 py-2.5 text-theme-text hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors min-w-0"
                                                >
                                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${NB_DOT[nb.color] || NB_DOT.default}`} />
                                                    <span className="truncate text-sm">{nb.name}</span>
                                                    <span className="ml-auto text-xs text-theme-text-dim/60 shrink-0">{nb.noteCount}</span>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(nb)}
                                                    className="p-2 text-theme-text-dim hover:text-red-400 transition-colors rounded-md hover:bg-theme-surface shrink-0"
                                                    title={`Delete "${nb.name}"`}
                                                    aria-label={`Delete notebook ${nb.name}`}
                                                >
                                                    <MdDeleteOutline size={17} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Bottom actions */}
                                <div className="border-t border-theme-border/50 pt-2 mt-1 space-y-1">
                                    <button onClick={() => { setIsProfileModalOpen(true); closeMobileMenu(); }} className="w-full text-left px-4 py-3 text-theme-text hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors">
                                        <MdSettings size={20} /> Profile
                                    </button>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-500 hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors">
                                        <MdLogout size={20} /> Logout
                                    </button>
                                    <button
                                        onClick={() => { setConfirmDeleteAccount(true); closeMobileMenu(); }}
                                        className="w-full text-left px-4 py-3 text-red-500/70 hover:bg-theme-surface rounded-md flex items-center gap-3 transition-colors"
                                    >
                                        <MdPersonOff size={20} /> Delete Account
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-2">
                                <Link to="/login" onClick={closeMobileMenu} className="w-full text-center py-3 rounded-md border border-theme-border text-theme-text font-medium hover:bg-theme-surface transition-colors">Login</Link>
                                <Link to="/signup" onClick={closeMobileMenu} className="w-full text-center py-3 rounded-md bg-theme-text text-theme-bg font-bold hover:opacity-90 transition-opacity">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Notebook?"
                message={`"${deleteTarget?.name}" will be deleted. Notes inside won't be deleted — they'll just become unassigned.`}
                confirmLabel="Delete"
                danger
                onConfirm={handleDeleteNotebook}
                onCancel={() => setDeleteTarget(null)}
            />

            <ConfirmModal
                isOpen={confirmDeleteAccount}
                title="Delete Account?"
                message="This will permanently delete your account, all your notes, and all your notebooks. This cannot be undone."
                confirmLabel="Delete My Account"
                danger
                onConfirm={handleDeleteAccount}
                onCancel={() => setConfirmDeleteAccount(false)}
            />
        </nav>
    );
};

export default Navbar;
