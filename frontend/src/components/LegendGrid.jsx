import { useMapStore } from "../hooks/useMapStore";
import { LAND_CLASSES } from "../constants/landClasses";
import { useLocale } from "../locale";

export default function LegendGrid() {
  const { activeClasses, toggleClass } = useMapStore();
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-1">
      {LAND_CLASSES.map((cls) => {
        const isActive = activeClasses.includes(cls.id);
        return (
          <button
            key={cls.id}
            onClick={() => toggleClass(cls.id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg
                        border text-left transition-all
                        ${
                          isActive
                            ? "bg-surface border-white/[0.15]"
                            : "bg-bg border-white/[0.07] opacity-40"
                        }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
              style={{ background: cls.color }}
            />
            <span className="text-[11px] text-white/70">{t(`mapViewer.landClassLabels.${cls.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
