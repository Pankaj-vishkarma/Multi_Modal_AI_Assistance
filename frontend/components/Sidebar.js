'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useEffect } from "react";
import { getChatHistory } from "../lib/api";

export function Sidebar({ isOpen, onClose, onNewChat, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);

  const [showSettings, setShowSettings] = useState(false);

  const { logout, user } = useContext(AuthContext);


  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const res = await getChatHistory();

        const formatted = (res.data || res).map((msg) => ({
          id: msg._id,
          title: msg.title || "New Chat",
          active: false,
          full: msg,
        }));

        setConversations(formatted);
      } catch (err) {
        if (err.message !== "Unauthorized") {
          console.error("History load error:", err.message);
        }
      }
    };

    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
    }
  }, [user]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen flex flex-col transition-all duration-300 z-50 border-r
${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={() => {
              onNewChat();
            }}
            className="w-full bg-gradient-to-r font-medium py-2 px-4 rounded-lg transition-all shadow-lg active:scale-95"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--accent-color), var(--accent-color))',
              color: 'var(--message-user-text)',
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          <p className="text-xs px-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Conversations
          </p>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setConversations((prev) =>
                  prev.map((c) => ({
                    ...c,
                    active: c.id === conv.id,
                  }))
                );

                if (onSelectConversation) {
                  onSelectConversation(conv);
                }
              }}
              className="w-full text-left px-3 py-2 rounded-lg transition-all text-sm border"
              style={{
                backgroundColor: conv.active ? 'var(--accent-color)' : 'transparent',
                color: conv.active ? 'var(--message-user-text)' : 'var(--text-secondary)',
                borderColor: conv.active ? 'var(--accent-color)' : 'var(--border-color)',
              }}
              onMouseEnter={(e) => {
                if (!conv.active) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!conv.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {conv.title}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          className="border-t p-4 space-y-2"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* SETTINGS BUTTON */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ⚙️ Settings
          </button>

          {/* LOGOUT BUTTON (TOGGLE) */}
          {showSettings && (
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all"
              style={{
                color: '#ff4d4f',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🚪 Logout
            </button>
          )}

          {/* HELP */}
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ❓ Help & Feedback
          </button>
        </div>
      </aside>
    </>
  );
}