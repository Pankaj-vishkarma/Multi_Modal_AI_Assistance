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

      // prevent duplicate calls
      if (isSendingRef.current) return;
      isSendingRef.current = true;

      setError(null);
      setIsLoading(true);

      // Create user message
      const newMessage = {
        id: Date.now() + Math.random(), // unique id
        role: 'user',
        content: userMessage,
        attachments,
        timestamp: new Date(),
      };

      // create updated state safely (NO double setMessages)
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      try {
        const conversationHistory = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let fullContent = '';
        let isFirstChunk = true;

        await streamChatMessage(userMessage, conversationHistory, (chunk) => {
          try {
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));

                if (data.content) {
                  fullContent += data.content;

                  // First chunk → create assistant message
                  if (isFirstChunk) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now() + Math.random(), // unique id
                        role: 'assistant',
                        content: fullContent,
                        timestamp: new Date(),
                      },
                    ]);
                    isFirstChunk = false;
                  }
                  // Next chunks → update last message
                  else {
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1].content = fullContent;
                      return updated;
                    });
                  }
                }
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });

      } catch (err) {
        const message = err.message || 'Failed to send message';

        setError(message);
        showErrorToast(message);
        console.error('Error sending message:', err);
      } finally {
        setIsLoading(false);

        // reset guard
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