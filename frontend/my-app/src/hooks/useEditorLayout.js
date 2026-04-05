import { useEffect, useRef, useState } from "react";
import { clamp } from "../utils/editorUtils";

export default function useEditorLayout(
  initialLeftWidth = 45,
  initialBottomHeight = 240
) {
  const mainGridRef = useRef(null);
  const rightPanelRef = useRef(null);
  const dragStateRef = useRef(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeftWidth);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(initialBottomHeight);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragStateRef.current) return;

      if (dragStateRef.current.type === "horizontal" && mainGridRef.current) {
        const rect = mainGridRef.current.getBoundingClientRect();
        const nextWidth = clamp(((event.clientX - rect.left) / rect.width) * 100, 28, 72);
        setLeftPanelWidth(nextWidth);
      }

      if (dragStateRef.current.type === "vertical" && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const maxHeight = Math.max(220, rect.height - 140);
        const nextHeight = clamp(rect.bottom - event.clientY, 160, maxHeight);
        setBottomPanelHeight(nextHeight);
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startHorizontalResize = () => {
    dragStateRef.current = { type: "horizontal" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const startVerticalResize = () => {
    dragStateRef.current = { type: "vertical" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";
  };

  return {
    mainGridRef,
    rightPanelRef,
    leftPanelWidth,
    bottomPanelHeight,
    setLeftPanelWidth,
    setBottomPanelHeight,
    startHorizontalResize,
    startVerticalResize,
  };
}