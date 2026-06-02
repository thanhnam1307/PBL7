import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PredictionPanel from "./PredictionPanel";
import { predictRegion } from "../api/predictionApi";
import { useMapStore } from "../hooks/useMapStore";

jest.mock("../api/predictionApi", () => ({
  predictRegion: jest.fn(),
}));

beforeEach(() => {
  predictRegion.mockResolvedValue({
    id: 1,
    status: "completed",
    statistics: [],
  });
  useMapStore.setState({
    selectedBbox: { west: 107.9, south: 15.9, east: 108.2, north: 16.1 },
    isSelectingRegion: false,
    predictionResult: null,
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test("submits Sentinel-2 region prediction payload", async () => {
  render(<PredictionPanel />);

  fireEvent.click(screen.getByText("Analyze Selected Region"));

  await waitFor(() => expect(predictRegion).toHaveBeenCalled());
  expect(predictRegion).toHaveBeenCalledWith({
    bbox: { west: 107.9, south: 15.9, east: 108.2, north: 16.1 },
    source: "sentinel-2",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    cloud_percent: 30,
    pixel_size_m: 10,
    image_size: 4096,
  });
  expect(useMapStore.getState().predictionResult.id).toBe(1);
});
