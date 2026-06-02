export const LAND_CLASSES = [
  { id: "water", label: "Water", color: "#419bdf", value: 72 },
  { id: "trees", label: "Trees", color: "#397d49", value: 90 },
  { id: "grass", label: "Grass", color: "#88b053", value: 50 },
  {
    id: "flooded_vegetation",
    label: "Flooded veg",
    color: "#7a87c6",
    value: 38,
  },
  { id: "crops", label: "Crops", color: "#e49635", value: 58 },
  {
    id: "shrub_and_scrub",
    label: "Shrub",
    color: "#dfc35a",
    value: 42,
  },
  { id: "built", label: "Built area", color: "#c4281b", value: 40 },
  { id: "bare", label: "Bare ground", color: "#a59b8f", value: 25 },
  { id: "snow_and_ice", label: "Snow / Ice", color: "#b39fe1", value: 15 },
];

export const MAP_STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  terrain: "mapbox://styles/mapbox/outdoors-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
};
