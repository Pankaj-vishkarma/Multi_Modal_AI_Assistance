'use client';

import ReactMarkdown from "react-markdown";
import { normalizeMediaUrl } from '../lib/api';

export function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'
        } animate-in fade-in slide-in-from-bottom-2`}
    >
      <div
        className="max-w-[80%] md:max-w-[60%] p-4 shadow-lg rounded-lg transition-colors duration-300"
        style={{
          backgroundColor: isUser ? 'var(--message-user-bg)' : 'var(--message-assistant-bg)',
          color: isUser ? 'var(--message-user-text)' : 'var(--message-assistant-text)',
          borderRadius: isUser
            ? '0.5rem 1rem 1rem 0.25rem'
            : '1rem 0.5rem 0.25rem 1rem',
        }}
      >
        <div className="text-sm leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2">{children}</p>,
              li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
            }}
          >
            {typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content)}
          </ReactMarkdown>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment, idx) => (
              <MediaPreviewItem key={idx} attachment={attachment} isUser={isUser} />
            ))}
          </div>
        )}

        <div
          className="text-xs mt-2 opacity-70"
          style={{
            color: isUser ? 'var(--message-user-text)' : 'var(--text-tertiary)',
          }}
        >
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            : ""}
        </div>
      </div>
    </div>
  );
}

function MediaPreviewItem({ attachment, isUser }) {
  const mediaUrl = normalizeMediaUrl(attachment.url);
  const isImage = attachment.type?.startsWith('image/');
  const isVideo = attachment.type?.startsWith('video/');
  const isAudio = attachment.type?.startsWith('audio/');
  const isPdf = attachment.type === 'application/pdf';

  if (isImage) {
    return (
      <img
        src={mediaUrl}
        alt="Attachment"
        onError={(e) => (e.target.style.display = "none")}
        className="rounded max-w-xs max-h-64 object-cover"
      />
    );
  }

  if (isVideo) {
    return (
      <video
        src={mediaUrl}
        controls
        onError={(e) => (e.target.style.display = "none")}
        className="rounded max-w-xs max-h-64"
      />
    );
  }

  if (isAudio) {
    return (
      <audio
        src={mediaUrl}
        controls
        className="w-full"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded px-3 py-2 text-xs"
      style={{
        backgroundColor: isUser ? 'rgba(0, 0, 0, 0.2)' : 'var(--bg-tertiary)',
        color: isUser ? 'var(--message-user-text)' : 'var(--text-primary)',
      }}
    >
      <span>{isPdf ? '📄' : '📎'}</span>
      <span>{attachment.name}</span>
    </div>
  );
}
