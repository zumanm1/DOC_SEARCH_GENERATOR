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
      // Check if we're in development or production environment
      const host = window.location.hostname;
      const port = "8000";
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

      // Use the current host in production, localhost in development
      const wsUrl = `${protocol}//${host === "localhost" ? host : host.split(":")[0]}:${port}/ws/${clientId}`;
      console.log(`Attempting to connect to WebSocket at: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected to backend");
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

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        // Only attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000) {
          setError("Backend server disconnected. Attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000); // Increased timeout to 5 seconds
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket connection error:", error);
        setError(
          "Cannot connect to backend server. Please ensure the Python backend is running on localhost:8000",
        );
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      setError(
        "Failed to create WebSocket connection. Backend server may not be running.",
      );
      setIsConnected(false);
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
