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
  activeLayer: "Composite",
  setActiveLayer: (l) => set({ activeLayer: l }),

  // Map coords (updated from map events)
  coords: { lat: 16.0678, lon: 108.2208, zoom: 4 },
  setCoords: (c) => set({ coords: c }),
}));
