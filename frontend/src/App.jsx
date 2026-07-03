import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Trash from "./pages/Trash";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  const { authUser, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <img src="/icons/icon-192.png" alt="Notary" style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.9 }} />
          <span style={{ color: "#94a3b8", fontSize: "14px", letterSpacing: "0.2em", fontFamily: "monospace" }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Landing />} />
        <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={authUser ? <Navigate to="/" /> : <Signup />} />
        <Route path="/trash" element={authUser ? <Trash /> : <Navigate to="/" />} />
      </Routes>
      <footer className="w-full border-t border-theme-border bg-theme-bg/80 backdrop-blur-md text-center py-3 text-sm text-theme-text-dim">
        Created by Aditya
        <a href="https://www.github.com/the-grandmaster0" target="_blank" rel="noreferrer"> (the-grandmaster0)</a> 😤
      </footer>
      {/* Toasts in bottom-right so they don't cover the navbar */}
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      {/* PWA install prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
