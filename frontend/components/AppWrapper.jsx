"use client";

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

export default function AppWrapper({ children }) {
    const { showAuthModal } = useContext(AuthContext);

    return (
        <>
            {/* BLUR EVERYTHING */}
            <div
                className={
                    showAuthModal
                        ? "blur-sm pointer-events-none select-none transition-all duration-300"
                        : "transition-all duration-300"
                }
            >
                {children}
            </div>

            {/*  MODAL (always on top) */}
            <AuthModal />
        </>
    );
}