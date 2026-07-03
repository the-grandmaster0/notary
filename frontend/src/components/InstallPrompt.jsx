import { useState, useEffect } from "react";
import { MdDownload, MdClose } from "react-icons/md";

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show if not already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        setDeferredPrompt(null);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm mx-auto px-4">
            <div className="bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-4 flex items-center gap-3">
                {/* App icon */}
                <img
                    src="/icons/icon-192.png"
                    alt="Notary icon"
                    className="w-12 h-12 rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-theme-text">Install Notary</p>
                    <p className="text-xs text-theme-text-dim">Add to your home screen for quick access</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                        onClick={handleInstall}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-theme-text text-theme-bg text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                        <MdDownload size={14} /> Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="flex items-center justify-center gap-1 px-3 py-1 rounded-md text-theme-text-dim hover:text-theme-text text-xs transition-colors"
                        aria-label="Dismiss install prompt"
                    >
                        <MdClose size={13} /> Not now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
