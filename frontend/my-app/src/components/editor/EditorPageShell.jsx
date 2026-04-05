import React from "react";

export default function EditorPageShell({
  mainGridRef,
  rightPanelRef,
  leftPanelWidth,
  bottomPanelHeight,
  startHorizontalResize,
  startVerticalResize,
  topbar,
  leftHeader = null,
  leftContent,
  rightTop,
  rightBottom,
  topRowHeight = 48,
}) {
  return (
    <div className="contest-editor-layout editor-page-theme">
      {topbar}

      <div
        className="editor-main-grid"
        ref={mainGridRef}
        style={{
          gridTemplateColumns: `${leftPanelWidth}% 8px calc(${100 - leftPanelWidth}% - 8px)`,
        }}
      >
        <aside className="editor-left-panel">
          {leftHeader}
          {leftContent}
        </aside>

        <div
          role="separator"
          aria-orientation="vertical"
          className="editor-resizer editor-resizer-vertical"
          onMouseDown={startHorizontalResize}
        />

        <section
          className="editor-right-panel"
          ref={rightPanelRef}
          style={{
            display: "grid",
            gridTemplateRows: `${topRowHeight}px minmax(0, 1fr) 8px ${bottomPanelHeight}px`,
          }}
        >
          {rightTop}

          <div
            role="separator"
            aria-orientation="horizontal"
            className="editor-resizer editor-resizer-horizontal"
            onMouseDown={startVerticalResize}
          />

          {rightBottom}
        </section>
      </div>
    </div>
  );
}