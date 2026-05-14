"use client";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setShowAuthModal(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, showAuthModal, setShowAuthModal }}
    >
      {children}
    </AuthContext.Provider>
  );
};