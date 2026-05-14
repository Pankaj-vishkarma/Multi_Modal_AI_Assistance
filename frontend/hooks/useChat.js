import { useState, useCallback, useRef } from 'react';
import { streamChatMessage, compareImagesAPI } from '../lib/api';
import { showErrorToast } from '../hooks/use-toast';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // prevent double trigger
  const isSendingRef = useRef(false);

  const sendMessage = useCallback(
    async (userMessage, attachments = []) => {
      if ((!userMessage || !userMessage.trim()) && attachments.length === 0) {
        return;
      }

      if (isSendingRef.current) return;
      isSendingRef.current = true;

      setError(null);
      setIsLoading(true);

      const newMessage = {
        id: Date.now() + Math.random(),
        role: 'user',
        content:
          userMessage === "__COMPARE_IMAGES__"
            ? "Comparing images..."
            : userMessage,
        attachments,
        timestamp: new Date(),
      };

      let conversationHistory = [];

      // SAFE STATE + CORRECT HISTORY
      setMessages((prev) => {
        const updated = [...prev, newMessage];

        conversationHistory = updated.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        return updated;
      });

      try {
        // ================= IMAGE COMPARISON FLOW =================
        if (userMessage === "__COMPARE_IMAGES__") {
          const response = await compareImagesAPI(attachments);

          if (!response?.success) {
            throw new Error(response?.message || "Comparison failed");
          }

          const comparisonText =
            response.data?.comparison || "No comparison result";

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              role: 'assistant',
              content: comparisonText,
              timestamp: new Date(),
            },
          ]);

          setIsLoading(false);
          isSendingRef.current = false;
          return;
        }

        // ================= NORMAL CHAT FLOW =================

        let fullContent = '';
        let isFirstChunk = true;

        await streamChatMessage(
          userMessage,
          conversationHistory,
          attachments,
          (chunk) => {
            try {
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
    [] //  NO stale dependency
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // for loading chat history
  const loadMessages = useCallback((msgs) => {
    setMessages(msgs);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
  };
};