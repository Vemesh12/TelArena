"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribeToRoom = (roomId: string, callback: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.emit("join:room", roomId);
    const eventName = `room:released:${roomId}`;
    socketRef.current.on(eventName, callback);

    return () => {
      socketRef.current?.off(eventName, callback);
    };
  };

  const subscribeToTournament = (tournamentId: string, callback: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.emit("join:tournament", tournamentId);
    const eventName = `leaderboard:update:${tournamentId}`;
    socketRef.current.on(eventName, callback);

    return () => {
      socketRef.current?.off(eventName, callback);
    };
  };

  const subscribeToPlayerNotifications = (playerId: string, callback: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.emit("join:player", playerId);
    const eventName = `notification:${playerId}`;
    socketRef.current.on(eventName, callback);

    return () => {
      socketRef.current?.off(eventName, callback);
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    subscribeToRoom,
    subscribeToTournament,
    subscribeToPlayerNotifications,
  };
}
