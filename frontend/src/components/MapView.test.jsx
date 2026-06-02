import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MapView from "./MapView";
import { useMapStore } from "../hooks/useMapStore";

jest.mock(
  "react-map-gl/mapbox",
  () => ({
    __esModule: true,
    default: ({ children, onClick }) => (
      <div
        data-testid="mapbox-map"
        onClick={() => onClick && onClick({ lngLat: { lng: 108.1, lat: 16.0 } })}
      >
        {children}
      </div>
    ),
    NavigationControl: () => <div data-testid="navigation-control" />,
    Source: ({ children, id, tiles, url, coordinates }) => (
      <div
        data-testid={id}
        data-tiles={JSON.stringify(tiles)}
        data-url={url}
        data-coordinates={JSON.stringify(coordinates)}
      >
        {children}
      </div>
    ),
    Layer: ({ id, paint }) => (
      <div data-testid={id} data-opacity={paint && paint["raster-opacity"]} />
    ),
  }),
  { virtual: true },
);

beforeEach(() => {
  process.env.REACT_APP_API_BASE_URL = "http://localhost:8000";
  process.env.REACT_APP_MAPBOX_TOKEN = "test-mapbox-token";
  useMapStore.setState({
    activeLayer: "AI Prediction",
    showDynamicWorld: false,
    showAiResult: true,
    viewMode: "top1",
    year: 2024,
    predictionResult: null,
    selectedBbox: { west: 107.9, south: 15.9, east: 108.2, north: 16.1 },
    showSelectedBbox: false,
    isSelectingRegion: false,
    selectionStart: null,
  });
  global.fetch = jest.fn();
});

afterEach(() => {
  delete process.env.REACT_APP_API_BASE_URL;
  delete process.env.REACT_APP_MAPBOX_TOKEN;
  jest.resetAllMocks();
});

test("renders prediction image overlay from the latest result", () => {
  useMapStore.setState({
    predictionResult: {
      output_png_url: "/outputs/result.png",
      bbox: { west: 107.9, south: 15.9, east: 108.2, north: 16.1 },
    },
  });

  render(<MapView />);

  expect(screen.getByTestId("prediction-result-source")).toHaveAttribute(
    "data-url",
    "http://localhost:8000/outputs/result.png",
  );
  expect(screen.getByTestId("prediction-result-overlay")).toHaveAttribute("data-opacity", "0.85");
});

test("loads and renders Dynamic World raster overlay", async () => {
  useMapStore.setState({ activeLayer: "Dynamic World", showDynamicWorld: true });
  global.fetch.mockResolvedValueOnce({
    ok: true,
    headers: { get: () => "application/json" },
    json: async () => ({
      layerId: "layer-1",
      tileTemplate: "http://localhost:8000/api/satellite/land-cover/tiles/layer-1/{z}/{x}/{y}.png",
    }),
  });

  render(<MapView />);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });
  const [requestedUrl] = global.fetch.mock.calls[0];

  expect(requestedUrl.toString()).toBe(
    "http://localhost:8000/api/satellite/land-cover/layer?year=2024&mode=top1&classes=water%2Ctrees%2Cgrass%2Cflooded_vegetation%2Ccrops%2Cshrub_and_scrub%2Cbuilt%2Cbare%2Csnow_and_ice",
  );

  expect(await screen.findByTestId("land-cover-source")).toHaveAttribute(
    "data-tiles",
    JSON.stringify([
      "http://localhost:8000/api/satellite/land-cover/tiles/layer-1/{z}/{x}/{y}.png",
    ]),
  );
  expect(screen.getByTestId("land-cover-overlay")).toHaveAttribute("data-opacity", "0.85");
});

test("does not render overlay when API fails", async () => {
  useMapStore.setState({ activeLayer: "Dynamic World", showDynamicWorld: true });
  global.fetch.mockResolvedValueOnce({
    ok: false,
    headers: { get: () => "application/json" },
    json: async () => ({ detail: "Missing GEE credentials" }),
  });

  render(<MapView />);

  expect(await screen.findByText("Missing GEE credentials")).toBeInTheDocument();
  expect(screen.queryByTestId("land-cover-source")).not.toBeInTheDocument();
});

test("updates selected region after two map clicks", () => {
  useMapStore.setState({
    isSelectingRegion: true,
    selectionStart: { lon: 107.9, lat: 15.9 },
  });

  render(<MapView />);
  fireEvent.click(screen.getByTestId("mapbox-map"));

  expect(useMapStore.getState().selectedBbox).toEqual({
    west: 107.9,
    south: 15.9,
    east: 108.1,
    north: 16.0,
  });
  expect(screen.getByTestId("selected-region-source")).toBeInTheDocument();
  expect(screen.getByTestId("selected-region-line")).toBeInTheDocument();
});

test("does not show selected region box before the user selects a region", () => {
  render(<MapView />);

  expect(screen.queryByTestId("selected-region-source")).not.toBeInTheDocument();
});

test("shows a setup message when Mapbox token is missing", () => {
  delete process.env.REACT_APP_MAPBOX_TOKEN;

  render(<MapView />);

  expect(
    screen.getByText("Set REACT_APP_MAPBOX_TOKEN in frontend/.env, then restart npm start."),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("mapbox-map")).not.toBeInTheDocument();
});
