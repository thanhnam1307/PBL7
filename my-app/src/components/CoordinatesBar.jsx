import { useMapStore } from "../hooks/useMapStore";

export default function CoordinatesBar() {
  const { coords } = useMapStore();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-8
                    flex items-center px-4 gap-6
                    bg-bg/85 backdrop-blur-md border-t border-white/[0.07]"
    >
      <Item label="LAT" value={`${coords.lat.toFixed(4)}°`} />
      <Divider />
      <Item label="LON" value={`${coords.lon.toFixed(4)}°`} />
      <Divider />
      <Item label="ZOOM" value={coords.zoom} />
      <Divider />
      <Item label="RES" value="10m/px" />

      {/* Live indicator */}
      <div className="ml-auto flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-accent
                         shadow-[0_0_6px_#2be8a4] animate-pulse"
        />
        <span className="text-[10px] text-accent tracking-widest">LIVE</span>
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="text-[10px] text-white/30 tracking-wider">
      {label}
      <span className="text-white/60 ml-1">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-3.5 bg-white/[0.07]" />;
}
