import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuthContext } from "./AuthContext";

const NotebookContext = createContext();

export const useNotebookContext = () => useContext(NotebookContext);

export const NotebookContextProvider = ({ children }) => {
    const { authUser } = useAuthContext();
    const [notebooks, setNotebooks] = useState([]);

    const fetchNotebooks = useCallback(async () => {
        if (!authUser) return;
        try {
            const res = await fetch("/api/notebooks", { credentials: "include" });
            if (res.ok) setNotebooks(await res.json());
        } catch { /* silent */ }
    }, [authUser]);

    // Load notebooks once the user is authenticated
    useEffect(() => {
        if (authUser) fetchNotebooks();
        else setNotebooks([]);
    }, [authUser, fetchNotebooks]);

    return (
        <NotebookContext.Provider value={{ notebooks, setNotebooks, fetchNotebooks }}>
            {children}
        </NotebookContext.Provider>
    );
};
