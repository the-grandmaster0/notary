import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { loading, login } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen mx-auto bg-theme-bg">
            <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-theme-surface border border-theme-border">
                <h1 className="text-3xl font-bold text-center text-theme-text mb-6">
                    Login <span className="text-theme-text-dim">Notary</span>
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Username or Email</span>
                        </label>
                        <input
                            id="username"
                            name="username"
                            autoComplete="username"
                            type="text"
                            placeholder="Enter username or email"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Password</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            type="password"
                            placeholder="Enter Password"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Link to="/signup" className="text-sm hover:underline hover:text-theme-text mt-2 inline-block text-theme-text-dim transition-colors">
                        Don't have an account?
                    </Link>
                    <div className="mt-6">
                        <button
                            className="w-full h-11 bg-theme-text text-theme-bg font-bold hover:opacity-90 transition-all rounded-md shadow-sm"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
