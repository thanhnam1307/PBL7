import HistoryTable from "../components/HistoryTable";

export default function HistoryPage() {
  return (
    <section className="h-full overflow-y-auto p-6">
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Analysis History</h1>
      <HistoryTable />
    </section>
  );
}
