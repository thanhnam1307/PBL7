import MapViewer from "../components/MapViewer";
import PredictionPanel from "../components/PredictionPanel";
import StatisticsPanel from "../components/StatisticsPanel";
import UploadPanel from "../components/UploadPanel";

export default function PredictionPage() {
  return (
    <div className="grid h-full grid-cols-[420px_1fr_340px] overflow-hidden">
      <aside className="space-y-6 overflow-y-auto border-r border-white/10 bg-bg-2 p-5">
        <UploadPanel />
        <PredictionPanel />
      </aside>
      <MapViewer />
      <aside className="overflow-y-auto border-l border-white/10 bg-bg-2 p-5">
        <StatisticsPanel />
      </aside>
    </div>
  );
}
