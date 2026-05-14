'use client';

import { useState, useRef } from 'react';

export function ChatInput({
  onSendMessage,
  isLoading,
  attachments = [],
  onAttachmentsChange,
}) {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const input = e.target;
    setMessage(input.value);

    // Auto-resize textarea
    input.style.height = 'auto';
    const newRows = Math.min(Math.ceil(input.scrollHeight / 24), 6);
    setRows(newRows);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();

    if (!message.trim() && attachments.length === 0) {
      return;
    }

    // store current attachments before clearing
    const currentAttachments = [...attachments];

    // detect multiple image attachments
    const imageFiles = currentAttachments.filter(
      (file) =>
        file instanceof File && file.type?.startsWith("image/")
    );

    if (imageFiles.length > 1) {
      // trigger image comparison
      onSendMessage("__COMPARE_IMAGES__", imageFiles);
    } else {
      onSendMessage(message.trim(), currentAttachments);
    }

    setMessage('');
    setRows(1);

    // slight delay prevents UI flicker/reset issue
    setTimeout(() => {
      onAttachmentsChange([]);
    }, 0);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // better control (avoid accidental submit)
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const removeAttachment = (index) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="border-t px-4 py-4 space-y-3 transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-300"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span className="text-xs">
                {attachment.type?.startsWith('image/')
                  ? '🖼️'
                  : attachment.type?.startsWith('video/')
                    ? '🎬'
                    : attachment.type?.startsWith('audio/')
                      ? '🎵'
                      : '📄'}
              </span>

              <span className="truncate max-w-[150px]">
                {attachment.name}
              </span>

              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-1 transition-colors duration-300"
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
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-col md:flex-row">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Ctrl+Enter to send)"
          rows={rows}
          disabled={isLoading}
          className="flex-1 rounded-lg px-4 py-3 focus:outline-none resize-none transition-all disabled:opacity-50 border"
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--input-text)',
            borderColor: 'var(--input-border)',
            '--tw-ring-color': 'var(--accent-color)',
          }}
        />

        <button
          type="submit"
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          className="font-medium px-6 py-3 rounded-lg transition-all self-end md:self-auto shadow-lg disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
          style={{
            backgroundColor:
              isLoading || (!message.trim() && attachments.length === 0)
                ? 'var(--bg-tertiary)'
                : 'var(--accent-color)',
            color:
              isLoading || (!message.trim() && attachments.length === 0)
                ? 'var(--text-tertiary)'
                : 'var(--message-user-text)',
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            '↑'
          )}
        </button>
      </div>
    </form>
  );
}