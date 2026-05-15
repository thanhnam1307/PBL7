import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 52 }}>
        <MapView />
        <Sidebar />
      </div>
    </div>
  );
}
