/**
 * WebSocket hook for communicating with Python backend
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  action: string;
  data: any;
}

interface WebSocketResponse {
  type: string;
  [key: string]: any;
}

export const useWebSocket = (clientId: string = "default") => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(
    new Map(),
  );

  const connect = useCallback(() => {
    try {
      const wsUrl = `ws://localhost:8000/ws/${clientId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketResponse = JSON.parse(event.data);
          setLastMessage(message);

          // Call specific handler if registered
          const handler = messageHandlersRef.current.get(message.type);
          if (handler) {
            handler(message);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
      };

      setSocket(ws);
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [clientId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
    }
  }, [socket]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socket && isConnected) {
        try {
          socket.send(JSON.stringify(message));
        } catch (err) {
          console.error("Error sending WebSocket message:", err);
          setError("Failed to send message");
        }
      } else {
        console.warn("WebSocket not connected, cannot send message");
        setError("WebSocket not connected");
      }
    },
    [socket, isConnected],
  );

  const onMessage = useCallback(
    (type: string, handler: (data: any) => void) => {
      messageHandlersRef.current.set(type, handler);

      // Return cleanup function
      return () => {
        messageHandlersRef.current.delete(type);
      };
    },
    [],
  );

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    onMessage,
    connect,
    disconnect,
  };
};
