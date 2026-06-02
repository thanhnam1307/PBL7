export const DANANG_VIEW_STATE = {
  latitude: 16.0678,
  longitude: 108.2208,
  zoom: 10,
};

export const DANANG_BOUNDARY_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Da Nang",
        note: "Temporary mainland administrative extent for AI land-cover preview.",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [107.8, 15.86],
            [108.36, 15.86],
            [108.36, 16.23],
            [107.8, 16.23],
            [107.8, 15.86],
          ],
        ],
      },
    },
  ],
};
