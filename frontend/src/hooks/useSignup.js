import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();

    const signup = async ({ username, email, password, confirmPassword }) => {
        const success = handleInputErrors({ username, email, password, confirmPassword });
        if (!success) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            localStorage.setItem("notary-user", JSON.stringify(data));
            setAuthUser(data);
            toast.success("Welcome, " + data.username);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, signup };
};

export default useSignup;

function handleInputErrors({ username, email, password, confirmPassword }) {
    if (!username || !email || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return false;
    }
    if (username.length < 4) {
        toast.error("Username must be at least 4 characters");
        return false;
    }
    if (!/^[a-zA-Z0-9]/.test(username)) {
        toast.error("Username must start with a letter or number");
        return false;
    }
    if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return false;
    }
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
    }
    return true;
}
