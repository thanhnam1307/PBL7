const STATS = [
  { val: "10", unit: "m", label: "Resolution" },
  { val: "9", unit: "", label: "Classes" },
  { val: "5", unit: "d", label: "Latency" },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="bg-bg border border-white/[0.07] rounded-lg p-2.5 flex flex-col gap-1"
        >
          <div className="font-display font-bold text-lg leading-none text-white">
            {s.val}
            {s.unit && (
              <span className="text-[11px] font-normal text-white/30 ml-0.5">
                {s.unit}
              </span>
            )}
          </div>
          <div className="text-[9px] tracking-wider text-white/30 uppercase">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
