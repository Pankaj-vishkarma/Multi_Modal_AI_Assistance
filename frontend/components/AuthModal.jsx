"use client";
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function AuthModal() {
    const { login, showAuthModal } = useContext(AuthContext);
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    // 🔥 NEW STATE FOR MESSAGE
    const [message, setMessage] = useState(null);
    const [type, setType] = useState("error");

    if (!showAuthModal) return null;

    const showMessage = (msg, type = "error") => {
        setMessage(msg);
        setType(type);

        setTimeout(() => {
            setMessage(null);
        }, 3000);
    };

    const handleSubmit = async () => {
        // FRONTEND VALIDATION
        if (!form.email || !form.password) {
            showMessage("Email and password are required");
            return;
        }

        if (!isLogin && !form.name) {
            showMessage("Name is required");
            return;
        }

        const url = isLogin
            ? `${BASE_URL}/auth/login`
            : `${BASE_URL}/auth/register`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.success) {
                if (isLogin) {
                    login(data);
                    showMessage("Login successful", "success");
                } else {
                    showMessage("Registered successfully, Please login", "success");
                    setIsLogin(true);
                }
            } else {
                showMessage(data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Auth error:", error);
            showMessage("Server error. Please try again.");
        }
    };

    return (
        <>
            {/* 🔥 TOP MESSAGE */}
            {message && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
                    <div
                        className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
                        style={{
                            backgroundColor:
                                type === "error" ? "#ef4444" : "#22c55e",
                            color: "#fff",
                        }}
                    >
                        {message}
                    </div>
                </div>
            )}

            <div className="fixed inset-0 flex items-center justify-center z-50">
                {/* BACKDROP */}
                <div
                    className="absolute inset-0 backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                />

                {/* MODAL */}
                <div
                    className="relative w-[320px] p-6 rounded-2xl shadow-2xl border transition-all duration-300"
                    style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                    }}
                >
                    <h2 className="text-lg font-semibold text-center mb-5">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    {!isLogin && (
                        <input
                            placeholder="Full Name"
                            className="w-full mb-3 px-3 py-2 rounded-lg outline-none border text-sm"
                            style={{
                                backgroundColor: "var(--bg-primary)",
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)",
                            }}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    )}

                    <input
                        placeholder="Email"
                        className="w-full mb-3 px-3 py-2 rounded-lg outline-none border text-sm"
                        style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-primary)",
                        }}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full mb-4 px-3 py-2 rounded-lg outline-none border text-sm"
                        style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-primary)",
                        }}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                        style={{
                            backgroundColor: "var(--accent-color)",
                            color: "#fff",
                        }}
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>

                    <p
                        className="text-xs mt-4 text-center cursor-pointer"
                        style={{ color: "var(--text-secondary)" }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin
                            ? "New user? Create account"
                            : "Already have an account? Login"}
                    </p>
                </div>
            </div>
        </>
    );
}