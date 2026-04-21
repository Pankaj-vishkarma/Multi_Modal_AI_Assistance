'use client';

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { MediaUploader } from '../components/MediaUploader';
import { useChat } from '../hooks/useChat';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAnalyze } from '../hooks/useAnalyze';

function HomeContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { analyze } = useAnalyze();

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();

  const handleSendMessage = async (message, messageAttachments) => {
    // Skip analyze for image comparison
    if (message !== "__COMPARE_IMAGES__") {
      for (const file of messageAttachments) {
        await analyze(file);
      }
    }

    sendMessage(message, messageAttachments);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // initial run
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClearChat = () => {
    clearMessages();
    setAttachments([]);
    setShowMediaUploader(false);
  };

  const handleMediaAdded = async (media) => {
    setAttachments((prev) => [...prev, media]);
  };

  return (
    <div
      className="h-screen flex overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleClearChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <Header
          onClearChat={handleClearChat}
          isChatEmpty={messages.length === 0}
        />

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-h-0 lg:flex-row lg:gap-6 lg:p-4">
          {/* Chat Column */}
          <div
            className="flex-1 flex flex-col min-h-0 lg:rounded-xl lg:border lg:overflow-hidden transition-colors duration-300"
            style={{
              borderColor: 'var(--border-color)',
            }}
          >
            <ChatWindow messages={messages} isLoading={isLoading} />

            {/* Media Uploader Section */}
            {showMediaUploader && (
              <div
                className="px-4 py-4 border-t"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Add Media Files
                  </p>
                  <button
                    onClick={() => setShowMediaUploader(false)}
                    className="transition-colors duration-300"
                    style={{
                      color: 'var(--text-tertiary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <MediaUploader
                  onMediaAdded={handleMediaAdded}
                  onMultipleFilesSelected={(files) => {
                    sendMessage("__COMPARE_IMAGES__", files);
                  }}
                />
              </div>
            )}

            {/* Chat Input */}
            <div className="relative">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
              />

              {/* Media Upload Toggle */}
              {!showMediaUploader && (
                <button
                  onClick={() => setShowMediaUploader(true)}
                  className="absolute bottom-[100%] right-4 mb-2 p-2 rounded-lg transition-all border active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-tertiary)',
                    borderColor: 'var(--border-color)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                  title="Add media file"
                >
                  📎
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Toggler for Mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden fixed bottom-3 left-4 p-3 rounded-full text-white shadow-lg z-40 active:scale-95 transition-all"
            style={{
              backgroundColor: 'var(--accent-color)',
            }}
            title="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="fixed bottom-4 right-4 max-w-md rounded-lg p-4"
            style={{
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderColor: '#ff6b6b',
              border: '1px solid',
              color: '#ff6b6b',
            }}
          >
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
