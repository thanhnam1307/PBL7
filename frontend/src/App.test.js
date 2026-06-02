import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "react-map-gl/mapbox",
  () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mapbox-map">{children}</div>,
    NavigationControl: () => <div data-testid="navigation-control" />,
    Source: ({ children, id }) => <div data-testid={id}>{children}</div>,
    Layer: ({ id }) => <div data-testid={id} />,
  }),
  { virtual: true },
);

jest.mock("./components/HistoryTable", () => function MockHistoryTable() {
  return <div data-testid="history-table" />;
});

test("renders the Da Nang dashboard", () => {
  render(<App />);
  expect(screen.getByText(/Da Nang Cadastre WebGIS/i)).toBeInTheDocument();
  expect(screen.getByTestId("history-table")).toBeInTheDocument();
});
