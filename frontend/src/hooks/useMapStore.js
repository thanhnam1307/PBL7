import { create } from "zustand";
import { LAND_CLASSES } from "../constants/landClasses";

export const useMapStore = create((set) => ({
  // View mode
  viewMode: "top1", // "top1" | "probability"
  setViewMode: (v) => set({ viewMode: v }),

  // Active land classes
  activeClasses: LAND_CLASSES.map((c) => c.id),
  toggleClass: (id) =>
    set((state) => ({
      activeClasses: state.activeClasses.includes(id)
        ? state.activeClasses.filter((c) => c !== id)
        : [...state.activeClasses, id],
    })),

  // Year
  year: 2024,
  setYear: (y) => set({ year: y }),

  // Opacity
  opacity: 85,
  setOpacity: (o) => set({ opacity: o }),

  // Basemap
  basemap: "satellite",
  setBasemap: (b) => set({ basemap: b }),

  // Layer
  activeLayer: "AI Prediction",
  setActiveLayer: (l) => set({ activeLayer: l }),
  showDynamicWorld: false,
  setShowDynamicWorld: (value) => set({ showDynamicWorld: value }),
  showAiResult: true,
  setShowAiResult: (value) => set({ showAiResult: value }),

  predictionResult: null,
  setPredictionResult: (result) => set({ predictionResult: result }),

  selectedBbox: {
    west: 107.9,
    south: 15.9,
    east: 108.25,
    north: 16.15,
  },
  showSelectedBbox: false,
  setSelectedBbox: (bbox) => set({ selectedBbox: bbox, showSelectedBbox: true }),
  isSelectingRegion: false,
  setIsSelectingRegion: (value) => set({ isSelectingRegion: value, selectionStart: value ? null : undefined }),
  selectionStart: null,
  setSelectionStart: (point) => set({ selectionStart: point }),

  // Map coords (updated from map events)
  coords: { lat: 16.0678, lon: 108.2208, zoom: 4 },
  setCoords: (c) => set({ coords: c }),
}));
