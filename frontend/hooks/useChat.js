import { useState, useCallback, useRef } from 'react';
import { streamChatMessage } from '../lib/api';
import { showErrorToast } from '../hooks/use-toast';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // prevent double trigger (IMPORTANT)
  const isSendingRef = useRef(false);

  const sendMessage = useCallback(
    async (userMessage, attachments = []) => {
      if (!userMessage.trim() && attachments.length === 0) {
        return;
      }

      if (isSendingRef.current) return;
      isSendingRef.current = true;

      setError(null);
      setIsLoading(true);

      const newMessage = {
        id: Date.now() + Math.random(),
        role: 'user',
        content: userMessage,
        attachments,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      try {
        const conversationHistory = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let fullContent = '';
        let isFirstChunk = true;

        await streamChatMessage(
          userMessage,
          conversationHistory,
          attachments, // IMPORTANT FIX
          (chunk) => {
            try {
              // NO parsing — chunk is already clean text
              fullContent += chunk;

              if (isFirstChunk) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Date.now() + Math.random(),
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date(),
                  },
                ]);
                isFirstChunk = false;
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = fullContent;
                  return updated;
                });
              }
            } catch (e) {
              console.error("Chunk error:", e);
            }
          }
        );

      } catch (err) {
        const message = err.message || 'Failed to send message';

        setError(message);
        showErrorToast(message);
        console.error('Error sending message:', err);
      } finally {
        setIsLoading(false);
        isSendingRef.current = false;
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};