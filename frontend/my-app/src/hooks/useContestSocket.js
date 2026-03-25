import { useEffect, useRef } from "react";

export default function useContestSocket(contestId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!contestId) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host =
      import.meta.env.VITE_WS_BASE_URL ||
      `${protocol}://127.0.0.1:8000`;

    const socket = new WebSocket(`${host}/ws/contest/${contestId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({ event: "ping" }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [contestId, onMessage]);

  return socketRef;
}