import { useState } from "react";
import { predictRegion } from "../api/predictionApi";
import { useMapStore } from "../hooks/useMapStore";

export default function PredictionPanel() {
  const {
    selectedBbox,
    setSelectedBbox,
    setPredictionResult,
    isSelectingRegion,
    setIsSelectingRegion,
  } = useMapStore();
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [cloudPercent, setCloudPercent] = useState(30);
  const [pixelSizeM, setPixelSizeM] = useState(10);
  const [imageSize, setImageSize] = useState(4096);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handlePredict() {
    setStatus("loading");
    setError("");
    try {
      const result = await predictRegion({
        bbox: selectedBbox,
        source: "sentinel-2",
        start_date: startDate,
        end_date: endDate,
        cloud_percent: Number(cloudPercent),
        pixel_size_m: Number(pixelSizeM),
        image_size: Number(imageSize),
      });
      setPredictionResult(result);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">Region Prediction</h2>
      <div className="rounded-md border border-white/10 bg-bg p-3">
        <button
          type="button"
          onClick={() => setIsSelectingRegion(!isSelectingRegion)}
          className={`w-full rounded-md px-3 py-2 text-[12px] font-semibold ${
            isSelectingRegion ? "bg-accent text-bg" : "bg-surface text-white"
          }`}
        >
          {isSelectingRegion ? "Click two map points" : "Select Region On Map"}
        </button>
        <button
          type="button"
          onClick={() =>
            setSelectedBbox({ west: 107.9, south: 15.9, east: 108.25, north: 16.15 })
          }
          className="mt-2 w-full rounded-md border border-white/10 px-3 py-2 text-[12px] text-white/65"
        >
          Use Da Nang Demo Region
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/45">
          {Object.entries(selectedBbox).map(([key, value]) => (
            <div key={key} className="rounded bg-bg-2 px-2 py-1.5">
              <span className="uppercase text-white/25">{key}</span>{" "}
              <span>{Number(value).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-[11px] uppercase tracking-widest text-white/30">
          Start
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-bg px-2 py-2 text-[12px] text-white"
          />
        </label>
        <label className="space-y-1 text-[11px] uppercase tracking-widest text-white/30">
          End
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-bg px-2 py-2 text-[12px] text-white"
          />
        </label>
        <label className="space-y-1 text-[11px] uppercase tracking-widest text-white/30">
          Cloud %
          <input
            type="number"
            min={0}
            max={100}
            value={cloudPercent}
            onChange={(event) => setCloudPercent(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-bg px-2 py-2 text-[12px] text-white"
          />
        </label>
        <label className="space-y-1 text-[11px] uppercase tracking-widest text-white/30">
          Pixel m
          <input
            type="number"
            min={1}
            max={300}
            value={pixelSizeM}
            onChange={(event) => setPixelSizeM(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-bg px-2 py-2 text-[12px] text-white"
          />
        </label>
        <label className="space-y-1 text-[11px] uppercase tracking-widest text-white/30">
          Max px
          <select
            value={imageSize}
            onChange={(event) => setImageSize(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-bg px-2 py-2 text-[12px] text-white"
          >
            <option value={1024}>1024</option>
            <option value={2048}>2048</option>
            <option value={4096}>4096</option>
            <option value={8192}>8192</option>
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={handlePredict}
        disabled={status === "loading"}
        className="w-full rounded-md border border-accent/35 bg-accent/10 px-3 py-2 text-[12px] font-semibold text-accent disabled:opacity-50"
      >
        {status === "loading" ? "Running AI..." : "Analyze Selected Region"}
      </button>
      {status === "success" && <p className="text-[12px] text-accent">Region analysis completed.</p>}
      {error && <p role="alert" className="text-[12px] text-red-300">{error}</p>}
    </section>
  );
}
