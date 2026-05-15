import React, { useCallback } from "react";
import ReactMapGL, { NavigationControl } from "react-map-gl/mapbox";
import { useMapStore } from "../hooks/useMapStore";
import CoordinatesBar from "./CoordinatesBar";

const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView() {
  const { basemap, setCoords } = useMapStore();

  const onMove = useCallback(
    ({ viewState }) => {
      setCoords({
        lat: viewState.latitude,
        lon: viewState.longitude,
        zoom: Math.round(viewState.zoom),
      });
    },
    [setCoords],
  );

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ReactMapGL
        initialViewState={{ latitude: 16.0678, longitude: 108.2208, zoom: 4 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[basemap]}
        mapboxAccessToken={MAPBOX_TOKEN}
        onMove={onMove}
      >
        <NavigationControl position="top-right" showCompass={false} />
      </ReactMapGL>

      {/* Search bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          background: "rgba(14,20,24,0.9)",
          backdropFilter: "blur(12px)",
          border: "0.5px solid rgba(255,255,255,0.13)",
          borderRadius: 10,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search location or coordinates…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "DM Mono, monospace",
            fontSize: 12,
            color: "#e8eef2",
            padding: "10px 0",
          }}
        />
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.2)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            padding: "2px 5px",
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 16,
          fontSize: 10,
          color: "rgba(255,255,255,0.1)",
          letterSpacing: "0.06em",
          pointerEvents: "none",
        }}
      >
        Google Earth Engine · WRI · © Dynamic World
      </div>

      <CoordinatesBar />
    </div>
  );
}
