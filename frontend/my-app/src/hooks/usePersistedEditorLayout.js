import { useEffect, useRef } from "react";

export default function usePersistedEditorLayout({
  leftPanelWidth,
  bottomPanelHeight,
  setLeftPanelWidth,
  setBottomPanelHeight,
  savedLeftPanelWidth,
  savedBottomPanelHeight,
  saveLeftPanelWidth,
  saveBottomPanelHeight,
}) {
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;

    if (typeof savedLeftPanelWidth === "number") {
      setLeftPanelWidth(savedLeftPanelWidth);
    }

    if (typeof savedBottomPanelHeight === "number") {
      setBottomPanelHeight(savedBottomPanelHeight);
    }

    hydratedRef.current = true;
  }, [
    savedLeftPanelWidth,
    savedBottomPanelHeight,
    setLeftPanelWidth,
    setBottomPanelHeight,
  ]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (typeof saveLeftPanelWidth !== "function") return;
    saveLeftPanelWidth((prev) =>
      prev === leftPanelWidth ? prev : leftPanelWidth
    );
  }, [leftPanelWidth, saveLeftPanelWidth]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (typeof saveBottomPanelHeight !== "function") return;
    saveBottomPanelHeight((prev) =>
      prev === bottomPanelHeight ? prev : bottomPanelHeight
    );
  }, [bottomPanelHeight, saveBottomPanelHeight]);
}