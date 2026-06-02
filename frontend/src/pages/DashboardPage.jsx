import HistoryTable from "../components/HistoryTable";
import StatisticsPanel from "../components/StatisticsPanel";

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="grid h-full grid-cols-[1fr_360px] overflow-hidden">
      <section className="overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Da Nang Cadastre WebGIS</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            Satellite imagery workspace for land-use classification, prediction history, and area statistics.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            ["Region", "Da Nang"],
            ["AI Classes", "6"],
            ["Backend", "FastAPI"],
            ["Storage", "SQLite"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-bg-2 p-4">
              <div className="text-[10px] uppercase tracking-widest text-white/30">{label}</div>
              <div className="mt-2 font-display text-xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate("map")}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg"
          >
            Open Map
          </button>
          <button
            type="button"
            onClick={() => onNavigate("prediction")}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/75"
          >
            Run Prediction
          </button>
        </div>
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold text-white">Recent Analyses</h2>
          <HistoryTable />
        </div>
      </section>
      <aside className="border-l border-white/10 bg-bg-2 p-5">
        <StatisticsPanel />
      </aside>
    </div>
  );
}
