import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("notary-user")) || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            if (!localStorage.getItem("notary-user")) {
                setLoading(false);
                return;
            }

            // Abort if the backend takes too long (Render free tier cold start)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

            try {
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (res.ok) {
                    const data = await res.json();
                    setAuthUser(data);
                    localStorage.setItem("notary-user", JSON.stringify(data));
                } else {
                    setAuthUser(null);
                    localStorage.removeItem("notary-user");
                }
            } catch (err) {
                clearTimeout(timeout);
                if (err.name === "AbortError") {
                    // Backend timed out (cold start) — keep cached user and continue
                    console.warn("Session verify timed out — using cached user");
                }
                // Any network error: keep cached user, don't boot them out
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
