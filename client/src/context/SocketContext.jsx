// @ts-nocheck
import { useAppStore } from "@/store";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { POST } from "@/utils/constants";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  connectionError: null
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { userInfo } = useAppStore();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const userId = userInfo?.id;

  useEffect(() => {
    // Reset states
    setIsConnected(false);
    setConnectionError(null);

    // Clean up previous connection
    if (socketRef.current) {
      console.log("🔄 Cleaning up previous socket connection");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    if (userId) {
      console.log("🔗 Connecting socket for user:", userId);
      
      const newSocket = io(POST, {
        query: { userId: userId },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: false, // Changed to false for better reconnection
      });

      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("✅ Socket CONNECTED successfully");
        console.log("Socket ID:", newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ SOCKET CONNECTION ERROR:", error.message);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // REMOVED ALL MESSAGE HANDLERS FROM HERE - they belong in MessageContainer
      // The SocketContext should only manage connection, not business logic

      newSocket.on("connection_success", (data) => {
        console.log("🔐 Socket authenticated:", data);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected. Reason:", reason);
        setIsConnected(false);
      });

      newSocket.on("error", (error) => {
        console.error("⚠️ Socket error:", error);
        setConnectionError(error.message);
      });

      // Add reconnect event
      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`♻️ Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
      });

      setSocket(newSocket);

      // Cleanup
      return () => {
        if (newSocket.connected) {
          console.log("🧹 SocketProvider cleanup - disconnecting socket");
          newSocket.disconnect();
        }
      };
    } else {
      setSocket(null);
      setIsConnected(false);
    }
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};