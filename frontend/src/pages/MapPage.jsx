import LayerControl from "../components/LayerControl";
import MapViewer from "../components/MapViewer";

export default function MapPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <MapViewer />
      <LayerControl />
    </div>
  );
}
