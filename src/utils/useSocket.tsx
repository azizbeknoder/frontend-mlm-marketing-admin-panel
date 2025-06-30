// utils/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Options {
  onConnect: () => void;
  card_info?: (data: any) => void;
}

export function useSocket({ onConnect, card_info }: Options) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    socketRef.current = io("http://localhost:3000", {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket ulandi");
      onConnect();
    });

    if (card_info) {
      socketRef.current.on("card_info", card_info);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
