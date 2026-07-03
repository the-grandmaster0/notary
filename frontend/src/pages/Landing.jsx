import { Link } from "react-router-dom";
import { MdSecurity, MdSpeed, MdCloudQueue } from "react-icons/md";
import Navbar from "../components/Navbar";

const Landing = () => {
    return (
        <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center relative overflow-hidden p-6 pt-24 text-center">
            <Navbar />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-text rounded-full blur-3xl mix-blend-overlay animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-theme-text-dim rounded-full blur-3xl mix-blend-overlay animate-pulse delay-700"></div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-theme-text mb-6 tracking-tighter">
                NOTARY
            </h1>
            <p className="text-xl md:text-2xl text-theme-text-dim mb-12 max-w-2xl leading-relaxed">
                Secure. Fast. Futuristic.<br />
                Create Your Notes and Manage Them Securely from Anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Link
                    to="/login"
                    className="px-8 py-3 rounded-md bg-theme-text text-theme-bg font-bold text-lg hover:opacity-90 transition-all shadow-lg"
                >
                    Create Notes
                </Link>
                <Link
                    to="/signup"
                    className="px-8 py-3 rounded-md border-2 border-theme-text text-theme-text font-bold text-lg hover:bg-theme-text hover:text-theme-bg transition-all"
                >
                    Create Your Account
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-theme-text-dim max-w-5xl">
                <div className="flex flex-col items-center gap-3 p-4 border border-theme-border/30 rounded-lg hover:border-theme-text/50 transition-colors">
                    <MdSecurity size={48} className="text-theme-text" />
                    <h3 className="text-xl font-bold text-theme-text">Encrypted Core</h3>
                    <p className="text-sm">Your thoughts are shielded by military-grade encryption protocols.</p>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 border border-theme-border/30 rounded-lg hover:border-theme-text/50 transition-colors">
                    <MdSpeed size={48} className="text-theme-text" />
                    <h3 className="text-xl font-bold text-theme-text">Zero Latency</h3>
                    <p className="text-sm">Instant synchronization across all your devices.</p>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 border border-theme-border/30 rounded-lg hover:border-theme-text/50 transition-colors">
                    <MdCloudQueue size={48} className="text-theme-text" />
                    <h3 className="text-xl font-bold text-theme-text">Cloud Uplink</h3>
                    <p className="text-sm">Access your notes from anywhere in the digital grid.</p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
