'use client';

import { useState } from 'react';

export function Sidebar({ isOpen, onClose, onNewChat }) {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Current Conversation', active: true },
  ]);

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
        onMouseLeave={undefined}
      >
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            onClick={() => {
              setConversations([{ id: Date.now(), title: 'New Conversation', active: true }]);
              onNewChat();
            }}
            className="w-full bg-gradient-to-r font-medium py-2 px-4 rounded-lg transition-all shadow-lg hover:shadow-lg active:scale-95"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--accent-color), var(--accent-color))',
              color: 'var(--message-user-text)',
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          <p className="text-xs px-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Conversations
          </p>
          {conversations.map((conv) => (
            <button
              key={conv.id}
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
          style={{
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all"
            style={{
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ⚙️ Settings
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all"
            style={{
              color: 'var(--text-secondary)',
            }}
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
