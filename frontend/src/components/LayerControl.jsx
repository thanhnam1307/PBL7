import { AI_LAND_CLASSES } from "../constants/aiLandClasses";
import { LAND_CLASSES } from "../constants/landClasses";
import { useMapStore } from "../hooks/useMapStore";
import { useLocale } from "../locale";

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
    setActiveClasses,
  } = useMapStore();
  const { t } = useLocale();

  return (
    <aside className="w-80 bg-bg-2 border-l border-white/10 overflow-y-auto">
      <PanelTitle title={t("layerControl.title")} />
      <Section label={t("layerControl.mode")}>
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: "AI Prediction", label: t("layerControl.aiPrediction") },
            { id: "Dynamic World", label: t("layerControl.dynamicWorld") },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setActiveLayer(option.id);
                if (option.id === "Dynamic World") setShowDynamicWorld(true);
                if (option.id === "AI Prediction") setShowAiResult(true);
              }}
              className={`rounded-md px-2 py-2 text-[11px] ${
                activeLayer === option.id
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-bg border border-white/10 text-white/45"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Section>
      <Section label={t("layerControl.visibleLayers")}>
        <label className="flex items-center justify-between rounded-md bg-bg px-3 py-2 text-[12px] text-white/70">
          {t("layerControl.dynamicWorld")}
          <input
            type="checkbox"
            checked={showDynamicWorld}
            onChange={(event) => setShowDynamicWorld(event.target.checked)}
            className="accent-accent"
          />
        </label>
        <label className="mt-2 flex items-center justify-between rounded-md bg-bg px-3 py-2 text-[12px] text-white/70">
          {t("layerControl.aiResult")}
          <input
            type="checkbox"
            checked={showAiResult}
            onChange={(event) => setShowAiResult(event.target.checked)}
            className="accent-accent"
          />
        </label>
      </Section>
      <Section label={t("layerControl.basemap")}>
        <div className="grid grid-cols-3 gap-1">
          {BASEMAPS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setBasemap(item)}
              className={`rounded-md px-2 py-2 text-[11px] capitalize ${
                basemap === item
                  ? "bg-surface text-white"
                  : "bg-bg text-white/45"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Section>
      <Section label={t("layerControl.dynamicWorldClasses")}>
        <div className="grid grid-cols-2 gap-1">
          {LAND_CLASSES.map((item) => {
            const active = activeClasses.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleClass(item.id)}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left ${
                  active
                    ? "border-white/20 bg-bg text-white/75"
                    : "border-white/10 bg-bg text-white/30"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: item.color }}
                />
                <span className="text-[11px]">
                  {t(`mapViewer.landClassLabels.${item.id}`)}
                </span>
              </button>
            );
          })}
        </div>
      </Section>
      <Section label={t("layerControl.aiClasses")}>
        <div className="grid grid-cols-2 gap-1">
          {AI_LAND_CLASSES.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md bg-bg px-2 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-[11px] text-white/65">
                {t(`mapViewer.aiClassLabels.${item.id}`)}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section label={t("layerControl.year")}>
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
      <Section label={t("layerControl.overlayOpacity")}>
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
      <div className="px-5 py-4">
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveClasses(LAND_CLASSES.map((item) => item.id))
            }
            className="flex-1 rounded-md border border-white/10 bg-bg px-3 py-2 text-[11px] text-white/75 transition hover:bg-white/5"
          >
            {t("layerControl.selectAll")}
          </button>
          <button
            type="button"
            onClick={() => setActiveClasses([])}
            className="flex-1 rounded-md border border-white/10 bg-bg px-3 py-2 text-[11px] text-white/75 transition hover:bg-white/5"
          >
            {t("layerControl.clearAll")}
          </button>
        </div>
      </div>
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
      {label ? (
        <div className="text-[10px] uppercase tracking-widest text-white/30">
          {label}
        </div>
      ) : null}
      {children}
    </section>
  );
}
