import { absoluteApiUrl } from "../api/http";
import { useMapStore } from "../hooks/useMapStore";

export default function StatisticsPanel() {
  const { predictionResult } = useMapStore();
  const stats = predictionResult?.statistics || [];
  const tiling = predictionResult?.source_metadata?.tiling;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">Land Statistics</h2>
      {!stats.length ? (
        <div className="rounded-md border border-white/10 bg-bg px-3 py-3 text-[12px] text-white/45">
          No prediction result yet.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1">
            {["png", "geotiff", "report"].map((type) => (
              <a
                key={type}
                href={absoluteApiUrl(`/api/history/${predictionResult.id}/download?type=${type}`)}
                className="rounded-md border border-white/10 px-2 py-1.5 text-center text-[10px] uppercase tracking-wider text-white/55 hover:text-accent"
              >
                {type}
              </a>
            ))}
          </div>
          {tiling && (
            <div className="rounded-md border border-white/10 bg-bg px-3 py-2 text-[11px] text-white/50">
              <div className="text-[10px] uppercase tracking-widest text-white/25">
                Tiling
              </div>
              <div className="mt-1">
                {tiling.tile_count} tiles · {tiling.tile_size_m}m x {tiling.tile_size_m}m
              </div>
            </div>
          )}
          {stats.map((item) => (
            <div key={item.id} className="rounded-md bg-bg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                <span className="text-[12px] text-white/80">{item.label}</span>
                <span className="ml-auto text-[12px] text-white/45">{item.percent}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${item.percent}%`, background: item.color }}
                />
              </div>
              <div className="mt-1 text-[10px] text-white/35">
                {Math.round(item.area_m2).toLocaleString()} m2
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
