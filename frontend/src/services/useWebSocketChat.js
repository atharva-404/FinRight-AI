import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for WebSocket-based chat communication with backend
 * 
 * Backend WebSocket endpoint: ws://<host>/ws/ai/chat/
 * 
 * Expected message format to backend:
 * {
 *   "question": "How much did I spend?",
 *   "document_id": 123  (optional, if None uses all documents)
 * }
 * 
 * Messages from backend:
 * - {"type": "token", "text": "word", "document_id": 123}
 * - {"type": "done", "complete": "full answer", "document_id": 123}
 * - {"type": "typing", "sender": "ai", "status": "start|stop", "document_id": 123}
 * - {"type": "error", "error": "error message"}
 */

export const useWebSocketChat = () => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // Build WebSocket URL dynamically with auth token
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const urlParams = token ? `?token=${token}` : '';
    const url = `${protocol}//localhost:8000/ws/ai/chat/${urlParams}`;
    return url;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'token':
              // Streaming token received
              setCurrentStreamingText((prev) => prev + (prev ? ' ' : '') + data.text);
              break;

            case 'typing':
              // Typing indicator
              if (data.status === 'start') {
                setIsTyping(true);
              } else if (data.status === 'stop') {
                setIsTyping(false);
              }
              break;

            case 'done':
              // Response complete
              if (data.complete) {
                setMessages((prev) => [
                  ...prev,
                  {
                    type: 'ai',
                    content: data.complete,
                    timestamp: new Date(),
                  },
                ]);
              }
              setCurrentStreamingText('');
              setIsTyping(false);
              break;

            case 'error':
              // Error message
              setError(data.error || 'An error occurred while processing your request');
              setMessages((prev) => [
                ...prev,
                {
                  type: 'error',
                  content: data.error,
                  timestamp: new Date(),
                },
              ]);
              setIsTyping(false);
              setCurrentStreamingText('');
              break;

            default:
              // Ignore unknown message types
              break;
          }
        } catch (err) {
          setError('Unable to process server response. Please try again.');
        }
      };

      ws.onerror = (event) => {
        setError('Connection error. Please check your internet connection.');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsTyping(false);
        // Don't show error here - let the reconnection logic handle it
      };

      wsRef.current = ws;
    } catch (err) {
      setError('Unable to connect to chat service. Please try again later.');
      setIsConnected(false);
    }
  }, [getWebSocketUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback(
    (question, documentId = null) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setError('Not connected to chat service');
        return;
      }

      if (!question || !question.trim()) {
        setError('Question cannot be empty');
        return;
      }

      try {
        // Add user message to history
        setMessages((prev) => [
          ...prev,
          {
            type: 'user',
            content: question,
            timestamp: new Date(),
            documentId,
          },
        ]);

        // Send message to backend
        const payload = {
          question: question.trim(),
          ...(documentId && { document_id: documentId }),
        };

        wsRef.current.send(JSON.stringify(payload));
        setError(null);
      } catch (err) {
        setError('Unable to send message. Please try again.');
      }
    },
    []
  );

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect if connection is lost (with max retry limit)
  useEffect(() => {
    let reconnectTimeout;

    if (!isConnected && retryCount < maxRetries) {
      reconnectTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        connect();
      }, Math.min(3000 * (retryCount + 1), 15000)); // Exponential backoff, max 15s
    } else if (retryCount >= maxRetries && !isConnected) {
      setError('Unable to connect after multiple attempts. Please refresh the page.');
    }

    // Reset retry count and clear error on successful connection
    if (isConnected && retryCount > 0) {
      setRetryCount(0);
      setError(null); // Clear any reconnection errors
    }

    return () => clearTimeout(reconnectTimeout);
  }, [isConnected, retryCount, connect, maxRetries]);

  return {
    isConnected,
    messages,
    isTyping,
    currentStreamingText,
    error,
    sendMessage,
    connect,
    disconnect,
    setMessages,
    setError,
  };
};
