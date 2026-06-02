import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactMapGL, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import CoordinatesBar from "./CoordinatesBar";
import { getLandCoverLayer } from "../api/satelliteApi";
import { absoluteApiUrl } from "../api/http";
import { DANANG_VIEW_STATE } from "../constants/danang";
import { useMapStore } from "../hooks/useMapStore";

const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};

const DANANG_IMAGE_COORDS = [
  [107.8, 16.23],
  [108.36, 16.23],
  [108.36, 15.86],
  [107.8, 15.86],
];

export default function MapViewer({ compact = false }) {
  const {
    basemap,
    setCoords,
    year,
    viewMode,
    activeClasses,
    showDynamicWorld,
    showAiResult,
    opacity,
    predictionResult,
    selectedBbox,
    showSelectedBbox,
    setSelectedBbox,
    isSelectingRegion,
    setIsSelectingRegion,
    selectionStart,
    setSelectionStart,
  } = useMapStore();
  const [landCoverLayer, setLandCoverLayer] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  const overlayPaint = useMemo(
    () => ({
      "raster-opacity": opacity / 100,
      "raster-fade-duration": 100,
    }),
    [opacity],
  );

  const predictionImageUrl = absoluteApiUrl(predictionResult?.output_png_url);
  const predictionCoordinates = useMemo(() => {
    const bbox = predictionResult?.bbox;
    if (!bbox) return DANANG_IMAGE_COORDS;
    return [
      [bbox.west, bbox.north],
      [bbox.east, bbox.north],
      [bbox.east, bbox.south],
      [bbox.west, bbox.south],
    ];
  }, [predictionResult?.bbox]);

  const selectedRegionGeoJson = useMemo(
    () => bboxToFeatureCollection(selectedBbox),
    [selectedBbox],
  );

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

  const onClick = useCallback(
    (event) => {
      if (!isSelectingRegion || !event.lngLat) return;

      const point = {
        lon: event.lngLat.lng,
        lat: event.lngLat.lat,
      };

      if (!selectionStart) {
        setSelectionStart(point);
        return;
      }

      setSelectedBbox({
        west: Math.min(selectionStart.lon, point.lon),
        south: Math.min(selectionStart.lat, point.lat),
        east: Math.max(selectionStart.lon, point.lon),
        north: Math.max(selectionStart.lat, point.lat),
      });
      setSelectionStart(null);
      setIsSelectingRegion(false);
    },
    [
      isSelectingRegion,
      selectionStart,
      setIsSelectingRegion,
      setSelectedBbox,
      setSelectionStart,
    ],
  );

  useEffect(() => {
    if (!showDynamicWorld) {
      setLandCoverLayer(null);
      setStatus("idle");
      return;
    }

    let ignore = false;
    setStatus("loading");
    setError("");
    getLandCoverLayer({ year, mode: viewMode, classes: activeClasses })
      .then((layer) => {
        if (!ignore) {
          setLandCoverLayer(layer);
          setStatus("ready");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setLandCoverLayer(null);
          setStatus("error");
          setError(err.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [showDynamicWorld, activeClasses, viewMode, year]);

  return (
    <div className="relative h-full flex-1 overflow-hidden bg-bg">
      {mapboxToken ? (
        <ReactMapGL
          initialViewState={DANANG_VIEW_STATE}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLES[basemap]}
          mapboxAccessToken={mapboxToken}
          onMove={onMove}
          onClick={onClick}
          cursor={isSelectingRegion ? "crosshair" : "grab"}
        >
          <NavigationControl position="top-right" showCompass={false} />
          {landCoverLayer?.tileTemplate && (
            <Source
              id="land-cover-source"
              type="raster"
              tiles={[landCoverLayer.tileTemplate]}
              tileSize={256}
            >
              <Layer id="land-cover-overlay" type="raster" paint={overlayPaint} />
            </Source>
          )}
          {showAiResult && predictionImageUrl && (
            <Source
              id="prediction-result-source"
              type="image"
              url={predictionImageUrl}
              coordinates={predictionCoordinates}
            >
              <Layer id="prediction-result-overlay" type="raster" paint={overlayPaint} />
            </Source>
          )}
          {showSelectedBbox && (
            <Source id="selected-region-source" type="geojson" data={selectedRegionGeoJson}>
              <Layer
                id="selected-region-fill"
                type="fill"
                paint={{ "fill-color": "#fbbf24", "fill-opacity": 0.12 }}
              />
              <Layer
                id="selected-region-line"
                type="line"
                paint={{ "line-color": "#fbbf24", "line-width": 2, "line-opacity": 0.9 }}
              />
            </Source>
          )}
        </ReactMapGL>
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/65">
          Set REACT_APP_MAPBOX_TOKEN in frontend/.env, then restart npm start.
        </div>
      )}
      {!compact && <CoordinatesBar />}
      {isSelectingRegion && (
        <div className="absolute left-4 top-4 rounded-md border border-amber-300/30 bg-bg-2/90 px-3 py-2 text-[11px] text-amber-100">
          {selectionStart ? "Click the opposite corner to finish" : "Click the first corner of the region"}
        </div>
      )}
      <StatusBadge status={status} error={error} />
    </div>
  );
}

function bboxToFeatureCollection(bbox) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[
            [bbox.west, bbox.south],
            [bbox.east, bbox.south],
            [bbox.east, bbox.north],
            [bbox.west, bbox.north],
            [bbox.west, bbox.south],
          ]],
        },
      },
    ],
  };
}

function StatusBadge({ status, error }) {
  if (status === "idle" || status === "ready") return null;
  return (
    <div className="absolute left-4 bottom-12 max-w-sm rounded-md border border-white/10 bg-bg-2/90 px-3 py-2 text-[11px] text-white/65">
      {status === "loading" ? "Loading satellite layer" : error}
    </div>
  );
}
