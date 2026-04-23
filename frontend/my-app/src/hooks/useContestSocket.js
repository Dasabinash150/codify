import { useEffect, useRef } from "react";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";

export default function useContestSocket(contestId, onMessage) {
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!contestId || socketRef.current) return;

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
        console.warn("WebSocket error (ignore in dev)");
      }
    };

    socket.onclose = () => {
      if (!isUnmounting) {
        console.log("WebSocket disconnected");
      }
      socketRef.current = null;
    };

    return () => {
      isUnmounting = true;
      socket.close();
      socketRef.current = null;
    };
  }, [contestId]);

  return socketRef;
}