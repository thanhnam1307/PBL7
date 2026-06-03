import { useRef, useState } from "react";
import { uploadRaster } from "../api/predictionApi";
import { useMapStore } from "../hooks/useMapStore";
import { useLocale } from "../locale";

export default function UploadPanel() {
  const inputRef = useRef(null);
  const { setPredictionResult } = useMapStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const { t } = useLocale();

  async function handleUpload() {
    if (!selectedFile) {
      setError(t("predictionPanel.chooseFile"));
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const result = await uploadRaster(selectedFile);
      setPredictionResult(result);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-white">
        {t("uploadPanel.title")}
      </h2>
      <div className="rounded-md border border-dashed border-white/15 bg-bg p-4">
        <input
          ref={inputRef}
          type="file"
          accept=".tif,.tiff,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-surface px-3 py-2 text-[12px] text-white"
        >
          {t("uploadPanel.selectFile")}
        </button>
        <div className="mt-3 text-[12px] text-white/55">
          {selectedFile ? selectedFile.name : t("uploadPanel.fileHint")}
        </div>
      </div>
      <button
        type="button"
        onClick={handleUpload}
        disabled={status === "loading"}
        className="w-full rounded-md bg-accent px-3 py-2 text-[12px] font-semibold text-bg disabled:opacity-50"
      >
        {status === "loading" ? t("uploadPanel.running") : t("uploadPanel.run")}
      </button>
      {status === "success" && (
        <p className="text-[12px] text-accent">{t("uploadPanel.success")}</p>
      )}
      {error && (
        <p role="alert" className="text-[12px] text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
