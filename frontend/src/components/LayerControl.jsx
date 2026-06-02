import { AI_LAND_CLASSES } from "../constants/aiLandClasses";
import { LAND_CLASSES } from "../constants/landClasses";
import { useMapStore } from "../hooks/useMapStore";

const BASEMAPS = ["satellite", "terrain", "dark"];

export default function LayerControl() {
  const {
    activeLayer,
    setActiveLayer,
    showDynamicWorld,
    setShowDynamicWorld,
    showAiResult,
    setShowAiResult,
    basemap,
    setBasemap,
    opacity,
    setOpacity,
    year,
    setYear,
    activeClasses,
    toggleClass,
  } = useMapStore();

  return (
    <aside className="w-80 bg-bg-2 border-l border-white/10 overflow-y-auto">
      <PanelTitle title="Layer Control" />
      <Section label="Mode">
        <div className="grid grid-cols-2 gap-1">
          {["AI Prediction", "Dynamic World"].map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => {
                setActiveLayer(layer);
                if (layer === "Dynamic World") setShowDynamicWorld(true);
                if (layer === "AI Prediction") setShowAiResult(true);
              }}
              className={`rounded-md px-2 py-2 text-[11px] ${
                activeLayer === layer
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-bg border border-white/10 text-white/45"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Visible Layers">
        <label className="flex items-center justify-between rounded-md bg-bg px-3 py-2 text-[12px] text-white/70">
          Dynamic World
          <input
            type="checkbox"
            checked={showDynamicWorld}
            onChange={(event) => setShowDynamicWorld(event.target.checked)}
            className="accent-accent"
          />
        </label>
        <label className="mt-2 flex items-center justify-between rounded-md bg-bg px-3 py-2 text-[12px] text-white/70">
          AI Result
          <input
            type="checkbox"
            checked={showAiResult}
            onChange={(event) => setShowAiResult(event.target.checked)}
            className="accent-accent"
          />
        </label>
      </Section>
      <Section label="Basemap">
        <div className="grid grid-cols-3 gap-1">
          {BASEMAPS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setBasemap(item)}
              className={`rounded-md px-2 py-2 text-[11px] capitalize ${
                basemap === item ? "bg-surface text-white" : "bg-bg text-white/45"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Section>
      <Section label="Dynamic World Classes">
        <div className="grid grid-cols-2 gap-1">
          {LAND_CLASSES.map((item) => {
            const active = activeClasses.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleClass(item.id)}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left ${
                  active ? "border-white/20 bg-bg text-white/75" : "border-white/10 bg-bg text-white/30"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Section>
      <Section label="AI Classes">
        <div className="grid grid-cols-2 gap-1">
          {AI_LAND_CLASSES.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-md bg-bg px-2 py-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
              <span className="text-[11px] text-white/65">{item.label}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section label="Year">
        <input
          type="range"
          min={2016}
          max={2026}
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 text-[11px] text-white/45">{year}</div>
      </Section>
      <Section label="Overlay Opacity">
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-1 text-[11px] text-white/45">{opacity}%</div>
      </Section>
    </aside>
  );
}

function PanelTitle({ title }) {
  return (
    <div className="border-b border-white/10 px-5 py-4">
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <section className="space-y-2 border-b border-white/5 px-5 py-4">
      <div className="text-[10px] uppercase tracking-widest text-white/30">{label}</div>
      {children}
    </section>
  );
}
