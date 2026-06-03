import { useMapStore } from "../hooks/useMapStore";
import LegendGrid from "./LegendGrid";
import StatsCards from "./StatsCards";
import { LAND_CLASSES } from "../constants/landClasses";
import { AI_LAND_CLASSES } from "../constants/aiLandClasses";
import { useLocale } from "../locale";

const LAYERS = [
  "AI model (temp)",
  "Composite",
  "Probability",
  "Change map",
  "Time series",
  "Raw bands",
];
const BASEMAPS = ["satellite", "terrain", "dark"];

export default function Sidebar() {
  const {
    viewMode,
    setViewMode,
    year,
    setYear,
    opacity,
    setOpacity,
    basemap,
    setBasemap,
    activeLayer,
    setActiveLayer,
  } = useMapStore();

  return (
    <div className="w-80 flex flex-col bg-bg-2 border-l border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
        <p className="text-[10px] tracking-widest text-white/30 uppercase mb-3">
          Visualization
        </p>
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 bg-bg rounded-lg p-1">
          {["top1", "probability"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`py-1.5 rounded-md text-[11px] tracking-wider transition-all
                ${
                  viewMode === mode
                    ? "bg-surface-2 text-white"
                    : "text-white/30 hover:text-white/50"
                }`}
            >
              {mode === "top1" ? "Top 1 Class" : "Probability"}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Time period */}
        <Section label="Time Period">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              ["Start", "Jan 2024"],
              ["End", "Dec 2024"],
            ].map(([l, v]) => (
              <div
                key={l}
                className="bg-bg border border-white/10 rounded-lg px-2.5 py-2
                              hover:border-white/20 transition-colors cursor-pointer"
              >
                <p className="text-[9px] tracking-wider text-white/30 mb-0.5">
                  {l}
                </p>
                <p className="text-[12px] text-white">{v}</p>
              </div>
            ))}
          </div>
          <input
            type="range"
            min={2016}
            max={2025}
            value={year}
            step={1}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            {["2016", "2019", "2022", "2025"].map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </Section>

        {/* Region */}
        <Section label="Region">
          <div
            className="w-full bg-bg border border-accent/25 text-white/70 font-mono
                       text-[12px] px-3 py-2 rounded-lg"
          >
            Da Nang, Viet Nam
          </div>
        </Section>

        {/* Stats */}
        <Section label="Coverage Stats">
          <StatsCards />
        </Section>

        {/* Land classes */}
        <Section label="Land Classes">
          {activeLayer === "AI model (temp)" ? <AiLegend /> : <LegendGrid />}
        </Section>

        {activeLayer === "AI model (temp)" && (
          <Section label="Temporary Note">
            <p className="text-[11px] leading-relaxed text-white/45">
              Dynamic World U-Net++ preview is limited to Da Nang. Region
              prediction uses Sentinel-2 multi-band imagery and the local
              PyTorch checkpoint.
            </p>
          </Section>
        )}

        <Section label="Cadastre">
          <p className="text-[11px] leading-relaxed text-white/45">
            Current boundary is a temporary Da Nang administrative extent for
            overlay clipping. Replace with official cadastral parcels when the
            source is available.
          </p>
        </Section>

        {/* Layer options */}
        <Section label="Layer Options">
          <div className="flex flex-wrap gap-1.5">
            {LAYERS.map((l) => (
              <button
                key={l}
                onClick={() => setActiveLayer(l)}
                className={`text-[10px] tracking-wider px-2.5 py-1.5 rounded-md border transition-all
                  ${
                    activeLayer === l
                      ? "text-accent border-accent/30 bg-accent/10"
                      : "text-white/30 border-white/[0.07] hover:text-white/50 hover:border-white/15"
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Section>

        {/* Opacity */}
        <Section label="Layer Opacity">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/50 shrink-0">Overlay</span>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="text-[11px] text-accent w-8 text-right">
              {opacity}%
            </span>
          </div>
        </Section>

        {/* Basemap */}
        <Section label="Basemap">
          <div className="grid grid-cols-3 gap-1.5">
            {BASEMAPS.map((b) => (
              <button
                key={b}
                onClick={() => setBasemap(b)}
                className={`py-2 text-[11px] capitalize rounded-lg border transition-all
                  ${
                    basemap === b
                      ? "text-accent border-accent/30 bg-accent/10"
                      : "text-white/30 border-white/[0.07] hover:text-white/50"
                  }`}
              >
                {b}
              </button>
            ))}
          </div>
        </Section>

        {/* Distribution bars */}
        <Section label="Class Distribution">
          <div className="flex items-end gap-1 h-14">
            {LAND_CLASSES.map((cls) => (
              <div
                key={cls.id}
                className="flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${cls.value}%`,
                  background: cls.color,
                  opacity: 0.75,
                }}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-white/[0.07] space-y-3">
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                           bg-accent/10 border border-accent/25 text-accent
                           text-[11px] tracking-wider opacity-50 cursor-not-allowed"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export GeoTIFF
        </button>
        <div className="flex gap-2 flex-wrap">
          {["Google Earth Engine", "WRI"].map((b) => (
            <span
              key={b}
              className="text-[9px] tracking-wider text-white/30
                             border border-white/[0.07] rounded px-1.5 py-0.5"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          {["Docs", "Data catalog", "GitHub"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[10px] text-white/20 hover:text-white/40 transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper wrapper
function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] tracking-widest text-white/30 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function AiLegend() {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-1">
      {AI_LAND_CLASSES.map((cls) => (
        <div
          key={cls.id}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                      border text-left bg-bg border-white/[0.07]"
        >
          <span
            className="w-2.5 h-2.5 rounded-[3px] shrink-0"
            style={{ background: cls.color }}
          />
          <span className="text-[11px] text-white/70">
            {t(`mapViewer.aiClassLabels.${cls.id}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
