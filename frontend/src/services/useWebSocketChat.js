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

  // Build WebSocket URL dynamically
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//localhost:8000/ws/ai/chat/`;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

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
              console.error('WebSocket error:', data.error);
              setError(data.error);
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
              console.warn('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse server response');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsTyping(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to connect to chat service');
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

        console.log('Sending WebSocket message:', payload);
        wsRef.current.send(JSON.stringify(payload));
        setError(null);
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('Failed to send message');
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

  // Reconnect if connection is lost
  useEffect(() => {
    if (!isConnected) {
      const reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);

      return () => clearTimeout(reconnectTimeout);
    }
  }, [isConnected, connect]);

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
