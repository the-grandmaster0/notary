import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("notary-user")) || null);
    const [loading, setLoading] = useState(true); // start true so we wait for verification

    // On mount, verify the session cookie is still valid with the backend
    useEffect(() => {
        const verifySession = async () => {
            // If no user in localStorage, skip the check
            if (!localStorage.getItem("notary-user")) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    // Refresh the stored user with latest data from DB (e.g. updated profilePic)
                    setAuthUser(data);
                    localStorage.setItem("notary-user", JSON.stringify(data));
                } else {
                    // Cookie expired or invalid — clear local state
                    setAuthUser(null);
                    localStorage.removeItem("notary-user");
                }
            } catch {
                // Network error — keep the cached user so the app doesn't flicker to login
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
