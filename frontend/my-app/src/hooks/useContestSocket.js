import { useEffect, useRef } from "react";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

export default function useContestSocket(contestId, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!contestId) return;

    let isUnmounting = false;

    const socket = new WebSocket(`${WS_BASE}/ws/contest/${contestId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isUnmounting) {
        console.log("WebSocket connected");
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    socket.onerror = () => {
      if (!isUnmounting) {
        console.log("WebSocket connection issue");
      }
    };

    socket.onclose = () => {
      if (!isUnmounting) {
        console.log("WebSocket disconnected");
      }
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };

    return () => {
      isUnmounting = true;

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        try {
          socket.close();
        } catch (e) {
          // ignore cleanup close errors
        }
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [contestId]);

  return socketRef;
}