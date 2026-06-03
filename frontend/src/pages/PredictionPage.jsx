import { useEffect, useRef, useState } from "react";
import MapViewer from "../components/MapViewer";
import PredictionPanel from "../components/PredictionPanel";
import StatisticsPanel from "../components/StatisticsPanel";
import UploadPanel from "../components/UploadPanel";
import { useLocale } from "../locale";

export default function PredictionPage() {
  const { t } = useLocale();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(420);
  const [rightWidth, setRightWidth] = useState(340);
  const [activeResizer, setActiveResizer] = useState(null);
  const dragOrigin = useRef({ startX: 0, leftWidth: 0, rightWidth: 0 });

  useEffect(() => {
    if (!activeResizer) return undefined;

    const handlePointerMove = (event) => {
      const deltaX = event.clientX - dragOrigin.current.startX;

      if (activeResizer === "left") {
        setLeftWidth((current) => {
          const next = dragOrigin.current.leftWidth + deltaX;
          return Math.min(Math.max(next, 260), 540);
        });
      }

      if (activeResizer === "right") {
        setRightWidth((current) => {
          const next = dragOrigin.current.rightWidth - deltaX;
          return Math.min(Math.max(next, 260), 540);
        });
      }
    };

    const handlePointerUp = () => {
      setActiveResizer(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activeResizer]);

  const startResize = (side, event) => {
    event.preventDefault();
    event.stopPropagation();
    dragOrigin.current = {
      startX: event.clientX,
      leftWidth,
      rightWidth,
    };
    setActiveResizer(side);
  };

  const gridTemplateColumns = [
    leftOpen ? `${leftWidth}px` : "0px",
    leftOpen ? "8px" : "0px",
    "1fr",
    rightOpen ? "8px" : "0px",
    rightOpen ? `${rightWidth}px` : "0px",
  ].join(" ");

  return (
    <div
      className="relative h-full min-h-0 min-w-0 grid overflow-hidden"
      style={{ gridTemplateColumns }}
    >
      <aside
        className="relative min-w-0 min-h-0 overflow-hidden border-r border-white/10 bg-bg-2 p-5 transition-all duration-200 flex flex-col"
        style={{ width: leftOpen ? leftWidth : 0, pointerEvents: leftOpen ? "auto" : "none" }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white">{t("predictionPage.leftPanel")}</div>
          <button
            type="button"
            onClick={() => setLeftOpen((prev) => !prev)}
            title={leftOpen ? t("predictionPage.hide") : t("predictionPage.show")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/80 transition hover:bg-white/10"
            aria-label={leftOpen ? t("predictionPage.hide") : t("predictionPage.show")}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              {leftOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 6l6 6-6 6" />
              )}
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6" style={{ display: leftOpen ? "block" : "none" }}>
          <UploadPanel />
          <PredictionPanel />
        </div>
      </aside>

      <div
        className={`bg-white/5 hover:bg-white/20 transition-colors ${leftOpen ? "cursor-ew-resize" : "w-0"}`}
        style={{ width: leftOpen ? 8 : 0 }}
        onPointerDown={leftOpen ? (event) => startResize("left", event) : undefined}
      />

      <div className="relative h-full min-h-0 min-w-0 w-full overflow-hidden">
        <MapViewer panelLayout={`${leftOpen}-${rightOpen}-${leftWidth}-${rightWidth}`} />
        {!leftOpen && (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            title={t("predictionPage.showLeft")}
            aria-label={t("predictionPage.showLeft")}
            className="absolute left-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg shadow-black/50 transition hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
        {!rightOpen && (
          <button
            type="button"
            onClick={() => setRightOpen(true)}
            title={t("predictionPage.showRight")}
            aria-label={t("predictionPage.showRight")}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg shadow-black/50 transition hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
      </div>

      {rightOpen && (
        <div
          className="cursor-ew-resize bg-white/5 hover:bg-white/20"
          onPointerDown={(event) => startResize("right", event)}
        />
      )}

      {rightOpen && (
        <aside
          className="relative min-w-0 min-h-0 overflow-hidden border-l border-white/10 bg-bg-2 p-5 transition-all duration-200 flex flex-col"
          style={{ width: rightWidth }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">{t("predictionPage.rightPanel")}</div>
            <button
              type="button"
              onClick={() => setRightOpen(false)}
              title={t("predictionPage.hide")}
              aria-label={t("predictionPage.hide")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/5 text-white/80 transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <StatisticsPanel />
          </div>
        </aside>
      )}
    </div>
  );
}
