import { useEffect, useState } from "react";
import { absoluteApiUrl } from "../api/http";
import { getHistoryItem, listHistory } from "../api/predictionApi";
import { useMapStore } from "../hooks/useMapStore";

export default function HistoryTable() {
  const { setPredictionResult } = useMapStore();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    listHistory()
      .then((rows) => {
        if (!ignore) setItems(rows);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSelect(item) {
    setLoadingId(item.id);
    setError("");
    try {
      setPredictionResult(await getHistoryItem(item.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  if (error) {
    return <div role="alert" className="rounded-md border border-red-300/20 bg-red-950/20 p-3 text-sm text-red-200">{error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-white/10">
      <table className="w-full text-left text-[12px]">
        <thead className="bg-bg-2 text-white/35 uppercase tracking-widest">
          <tr>
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Area</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Files</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-bg">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-white/[0.03]">
              <td className="px-3 py-2 text-accent">
                <button type="button" onClick={() => handleSelect(item)}>
                  {loadingId === item.id ? "Loading" : `#${item.id}`}
                </button>
              </td>
              <td className="px-3 py-2 text-white/65">{item.source_type}</td>
              <td className="px-3 py-2 text-white/65">{item.status}</td>
              <td className="px-3 py-2 text-white/45">
                {Math.round(item.total_area_m2 || 0).toLocaleString()} m2
              </td>
              <td className="px-3 py-2 text-white/45">
                {new Date(item.created_at).toLocaleString()}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2 text-[10px] uppercase tracking-wider">
                  {["png", "geotiff", "report"].map((type) => (
                    <a
                      key={type}
                      href={absoluteApiUrl(`/api/history/${item.id}/download?type=${type}`)}
                      className="text-white/35 hover:text-accent"
                    >
                      {type}
                    </a>
                  ))}
                </div>
              </td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td className="px-3 py-6 text-center text-white/35" colSpan={6}>
                No analysis history yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
