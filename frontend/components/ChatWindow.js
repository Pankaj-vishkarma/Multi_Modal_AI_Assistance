'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';

export function ChatWindow({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-4">
              <div className="text-4xl">✨</div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Start a Conversation
              </h2>
              <p className="max-w-md mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Upload images, videos, audio files, or PDFs and ask questions
                about them. You can also have regular text conversations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={`${message.id}-${index}`} message={message} index={index} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div
                  className="rounded-lg p-4 shadow-lg"
                  style={{
                    backgroundColor: 'var(--message-assistant-bg)',
                    color: 'var(--message-assistant-text)',
                    borderRadius: '1rem 0.5rem 0.25rem 1rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex gap-2">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: 'var(--accent-color)',
                        animationDelay: '0.1s',
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: 'var(--accent-color)',
                        animationDelay: '0.2s',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
