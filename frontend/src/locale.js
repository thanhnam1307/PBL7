import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TRANSLATIONS = {
  en: {
    nav: {
      dashboard: "Dashboard",
      map: "Map",
      prediction: "Prediction",
      history: "History",
    },
    header: {
      toggleLabel: "Switch language",
    },
    dashboard: {
      title: "Da Nang Cadastre WebGIS",
      subtitle:
        "Satellite imagery workspace for land-use classification, prediction history, and area statistics.",
      stats: {
        region: "Region",
        regionValue: "Da Nang",
        aiClasses: "AI Classes",
        backend: "Backend",
        storage: "Storage",
      },
      openMap: "Open Map",
      runPrediction: "Run Prediction",
      recentAnalyses: "Recent Analyses",
    },
    history: {
      title: "Analysis History",
    },
    predictionPage: {
      leftPanel: "Left Sidebar",
      rightPanel: "Right Sidebar",
      hide: "Hide",
      show: "Show",
      showLeft: "Show left",
      showRight: "Show right",
    },
    layerControl: {
      title: "Layer Control",
      mode: "Mode",
      visibleLayers: "Visible Layers",
      basemap: "Basemap",
      dynamicWorldClasses: "Dynamic World Classes",
      aiClasses: "AI Classes",
      aiPrediction: "AI Prediction",
      year: "Year",
      overlayOpacity: "Overlay Opacity",
      selectAll: "Select all",
      clearAll: "Clear all",
      dynamicWorld: "Dynamic World",
      aiResult: "AI Result",
    },
    predictionPanel: {
      title: "Region Prediction",
      selectRegion: "Select Region On Map",
      useDemo: "Use Da Nang Demo Region",
      start: "Start",
      end: "End",
      cloudPercent: "Cloud %",
      pixelSize: "Pixel m",
      maxPx: "Max px",
      runAnalysis: "Analyze Selected Region",
      running: "Running AI...",
      success: "Region analysis completed.",
      noRegion: "No region selected yet.",
      steps: {
        selectRegion: "Select region",
        adjustFilters: "Adjust filters",
        runAnalysis: "Run analysis",
        reviewResult: "Review result",
      },
      current: "Current",
      waiting: "Waiting",
      chooseFile: "Choose a raster or image file first.",
    },
    uploadPanel: {
      title: "Upload Raster",
      selectFile: "Select File",
      fileHint: "GeoTIFF, TIFF, PNG, or JPG",
      run: "Run Upload Prediction",
      running: "Running AI...",
      success: "Prediction completed.",
    },
    statisticsPanel: {
      title: "Land Statistics",
      noResult: "No prediction result yet.",
      tiling: "Tiling",
    },
    mapViewer: {
      mapOverview: "Map overview",
      quickSummary: "Quick summary",
      dynamicWorld: "Dynamic World",
      aiOverlay: "AI overlay",
      aiPrediction: "AI Prediction",
      prediction: "Prediction",
      selectedRegion: "Selected region",
      noRegion: "No region selected yet.",
      size: "Size",
      west: "W",
      east: "E",
      south: "S",
      north: "N",
      legend: "Legend",
      hidden: "Hidden",
      noClasses: "No classes selected",
      aiLegendNote: "AI overlay shows predicted land classes for selected region.",
      enableLayerHint: "Enable a layer from the controls to preview map data.",
      on: "On",
      off: "Off",
      live: "Live",
      updating: "Updating",
      hide: "Hide",
      show: "Show",
      showOverview: "Show overview",
      showLegend: "Show legend",
      dynamicWorldClasses: "Dynamic World classes",
      landClassLabels: {
        water: "Water",
        trees: "Trees",
        grass: "Grass",
        flooded_vegetation: "Flooded veg",
        crops: "Crops",
        shrub_and_scrub: "Shrub",
        built: "Built area",
        bare: "Bare ground",
        snow_and_ice: "Snow / Ice",
      },
      aiClassLabels: {
        water: "Water",
        vegetation: "Vegetation",
        agriculture: "Agriculture",
        built_up: "Built up",
        bare: "Bare",
      },
      selectionTooltip: "Selection tooltip",
      selectionStart: "Click the first corner of the region",
      selectionFinish: "Click the opposite corner to finish",
      current: "Current",
      start: "Start",
      loadingSatelliteLayer: "Loading satellite layer",
    },
  },
  vi: {
    nav: {
      dashboard: "Bảng điều khiển",
      map: "Bản đồ",
      prediction: "Dự đoán",
      history: "Lịch sử",
    },
    header: {
      toggleLabel: "Chuyển đổi ngôn ngữ",
    },
    dashboard: {
      title: "Da Nang Cadastre WebGIS",
      subtitle:
        "Không gian làm việc ảnh vệ tinh cho phân tích sử dụng đất, lịch sử dự đoán và thống kê diện tích.",
      stats: {
        region: "Khu vực",
        regionValue: "Đà Nẵng",
        aiClasses: "Lớp AI",
        backend: "Backend",
        storage: "Lưu trữ",
      },
      openMap: "Mở bản đồ",
      runPrediction: "Chạy dự đoán",
      recentAnalyses: "Phân tích gần đây",
    },
    history: {
      title: "Lịch sử phân tích",
    },
    predictionPage: {
      leftPanel: "Điều khiển bên trái",
      rightPanel: "Thống kê bên phải",
      hide: "Ẩn",
      show: "Hiện",
      showLeft: "Mở trái",
      showRight: "Mở phải",
    },
    layerControl: {
      title: "Điều khiển Layer",
      mode: "Chế độ",
      visibleLayers: "Lớp hiển thị",
      basemap: "Bản đồ nền",
      dynamicWorldClasses: "Lớp Dynamic World",
      aiClasses: "Lớp AI",
      aiPrediction: "Dự đoán AI",
      year: "Năm",
      overlayOpacity: "Độ mờ lớp phủ",
      selectAll: "Chọn tất cả",
      clearAll: "Bỏ chọn",
      dynamicWorld: "Dynamic World",
      aiResult: "Kết quả AI",
    },
    predictionPanel: {
      title: "Dự đoán vùng",
      selectRegion: "Chọn vùng trên bản đồ",
      useDemo: "Dùng vùng mẫu Đà Nẵng",
      start: "Bắt đầu",
      end: "Kết thúc",
      cloudPercent: "% mây",
      pixelSize: "Pixel m",
      maxPx: "Max px",
      runAnalysis: "Phân tích vùng đã chọn",
      running: "Đang chạy AI...",
      success: "Phân tích hoàn thành.",
      noRegion: "Chưa có vùng nào được chọn.",
      steps: {
        selectRegion: "Chọn vùng",
        adjustFilters: "Điều chỉnh bộ lọc",
        runAnalysis: "Chạy phân tích",
        reviewResult: "Xem kết quả",
      },
      current: "Hiện tại",
      waiting: "Đang chờ",
      chooseFile: "Chọn file raster hoặc ảnh trước.",
    },
    uploadPanel: {
      title: "Tải lên Raster",
      selectFile: "Chọn file",
      fileHint: "GeoTIFF, TIFF, PNG, hoặc JPG",
      run: "Chạy dự đoán tải lên",
      running: "Đang chạy AI...",
      success: "Dự đoán hoàn thành.",
    },
    statisticsPanel: {
      title: "Thống kê đất đai",
      noResult: "Chưa có kết quả dự đoán.",
      tiling: "Tách ô",
    },
    mapViewer: {
      mapOverview: "Tổng quan bản đồ",
      quickSummary: "Tóm tắt nhanh",
      dynamicWorld: "Dynamic World",
      aiOverlay: "Lớp AI",
      aiPrediction: "Dự đoán AI",
      prediction: "Dự đoán",
      selectedRegion: "Vùng đã chọn",
      noRegion: "Chưa có vùng nào được chọn.",
      size: "Kích thước",
      west: "T",
      east: "Đ",
      south: "N",
      north: "B",
      legend: "Chú giải",
      hidden: "Ẩn",
      noClasses: "Chưa chọn lớp nào",
      aiLegendNote: "Lớp AI hiển thị phân loại đất dự đoán cho vùng đã chọn.",
      enableLayerHint: "Bật một lớp từ điều khiển để xem dữ liệu bản đồ.",
      on: "Bật",
      off: "Tắt",
      live: "Trực tiếp",
      updating: "Đang cập nhật",
      hide: "Ẩn",
      show: "Hiện",
      showOverview: "Hiện tổng quan",
      showLegend: "Hiện chú giải",
      dynamicWorldClasses: "Lớp Dynamic World",
      landClassLabels: {
        water: "Nước",
        trees: "Cây",
        grass: "Cỏ",
        flooded_vegetation: "Thảm thực vật ngập nước",
        crops: "Nông nghiệp",
        shrub_and_scrub: "Cây bụi",
        built: "Khu vực xây dựng",
        bare: "Mặt đất trống",
        snow_and_ice: "Tuyết / Băng",
      },
      aiClassLabels: {
        water: "Nước",
        vegetation: "Thảm thực vật",
        agriculture: "Nông nghiệp",
        built_up: "Khu vực xây dựng",
        bare: "Trống",
      },
      selectionTooltip: "Gợi ý chọn vùng",
      selectionStart: "Nhấp vào góc đầu tiên của vùng",
      selectionFinish: "Nhấp vào góc đối diện để hoàn tất",
      current: "Hiện tại",
      start: "Bắt đầu",
      loadingSatelliteLayer: "Đang tải lớp vệ tinh",
    },
  },
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(
    () => window.localStorage.getItem("app_locale") || "en",
  );

  useEffect(() => {
    window.localStorage.setItem("app_locale", locale);
  }, [locale]);

  const toggleLocale = () => setLocale((current) => (current === "en" ? "vi" : "en"));

  const t = useMemo(
    () => (key) => {
      const parts = key.split(".");
      let result = TRANSLATIONS[locale];
      for (const part of parts) {
        result = result?.[part];
        if (result === undefined) return key;
      }
      return result;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return value;
}
