'use client';

import { useTheme } from '../contexts/ThemeContext';

export function Header({ onClearChat, isChatEmpty }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header 
      className="border-b px-4 py-4 flex items-center justify-between transition-colors duration-300"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderColor: 'var(--header-border)',
        color: 'var(--header-text)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-color to-accent-color rounded-lg flex items-center justify-center shadow-lg"
          style={{
            backgroundImage: `linear-gradient(to bottom right, var(--accent-color), var(--accent-color))`,
          }}>
          <span className="text-white text-lg font-bold">✨</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--header-text)' }}>
            AI Assistant
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Multimodal Chat with Media
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg transition-colors duration-300 hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1h4zm-6 8a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              <path d="M10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1z" />
              <path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10zM9 6a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm2-2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Clear Chat Button */}
        {!isChatEmpty && (
          <button
            onClick={onClearChat}
            className="text-sm px-4 py-2 rounded-lg transition-all duration-300 border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
          >
            Clear Chat
          </button>
        )}
      </div>
    </header>
  );
}
