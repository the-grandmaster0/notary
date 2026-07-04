import { useState } from "react";
import { Link } from "react-router-dom";
import useSignup from "../hooks/useSignup";

const Signup = () => {
    const [inputs, setInputs] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { loading, signup } = useSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(inputs);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen mx-auto bg-theme-bg">
            <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-theme-surface border border-theme-border">
                <h1 className="text-3xl font-bold text-center text-theme-text mb-6">
                    Sign Up <span className="text-theme-text-dim">Notary</span>
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Username</span>
                        </label>
                        <input
                            id="username"
                            name="username"
                            autoComplete="username"
                            type="text"
                            placeholder="Choose a username"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                        />
                        <p className="text-xs text-theme-text-dim mt-1">Min 4 characters, must start with a letter or number</p>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Email</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Password</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            type="password"
                            placeholder="Create a password"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block mb-2">
                            <span className="text-sm font-medium text-theme-text-dim">Confirm Password</span>
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            type="password"
                            placeholder="Confirm your password"
                            className="w-full h-11 bg-theme-bg border border-theme-border text-theme-text focus:border-theme-text focus:outline-none placeholder-theme-text-dim px-4 rounded-md transition-colors"
                            value={inputs.confirmPassword}
                            onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                        />
                    </div>
                    <Link to="/login" className="text-sm hover:underline hover:text-theme-text mt-2 inline-block text-theme-text-dim transition-colors">
                        Already have an account?
                    </Link>
                    <div className="mt-6">
                        <button
                            className="w-full h-11 bg-theme-text text-theme-bg font-bold hover:opacity-90 transition-all rounded-md shadow-sm"
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
