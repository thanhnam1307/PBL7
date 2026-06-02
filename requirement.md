# YÊU CẦU CODEX: CẤU TRÚC LẠI TOÀN BỘ CHƯƠNG TRÌNH THÀNH BACKEND + FRONTEND

Bạn hãy giúp tôi cấu trúc lại toàn bộ chương trình hiện tại thành một hệ thống WebGIS hoàn chỉnh dùng cho bài toán:

**Xây dựng hệ thống ảnh vệ tinh phục vụ địa chính thành phố Đà Nẵng, sử dụng mô hình AI để phân loại sử dụng đất.**

Hệ thống cần được chia rõ thành 2 phần:

- Backend
- Frontend

Mục tiêu là xây dựng một ứng dụng web cho phép người dùng xem bản đồ vệ tinh khu vực Đà Nẵng, tải ảnh vệ tinh lên hoặc chọn khu vực cần phân tích, sau đó dùng model AI đã huấn luyện để phân loại đất và hiển thị kết quả trên bản đồ.

---

## 1. Mục tiêu hệ thống

Hệ thống cần hỗ trợ các chức năng chính:

1. Hiển thị bản đồ khu vực thành phố Đà Nẵng.
2. Cho phép người dùng xem ảnh vệ tinh hoặc lớp bản đồ nền.
3. Cho phép upload ảnh vệ tinh hoặc file raster.
4. Cho phép chọn khu vực cần phân loại đất.
5. Gọi model AI để phân loại sử dụng đất từ ảnh vệ tinh.
6. Hiển thị kết quả phân loại đất lên bản đồ.
7. Cho phép xem thống kê diện tích từng loại đất.
8. Cho phép lưu lịch sử phân tích.
9. Cho phép tải kết quả phân loại dưới dạng ảnh, GeoTIFF hoặc báo cáo.
10. Thiết kế giao diện hiện đại, dễ sử dụng, phù hợp với hệ thống quản lý địa chính.

---

## 2. Cấu trúc thư mục yêu cầu

Hãy tổ chức lại project theo cấu trúc sau:

```txt
satellite-land-classification/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   ├── satellite.py
│   │   │   │   ├── prediction.py
│   │   │   │   ├── statistics.py
│   │   │   │   └── history.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── satellite_image.py
│   │   │   ├── prediction_result.py
│   │   │   └── land_class.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── user_schema.py
│   │   │   ├── prediction_schema.py
│   │   │   └── statistics_schema.py
│   │   │
│   │   ├── services/
│   │   │   ├── image_service.py
│   │   │   ├── geo_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── statistics_service.py
│   │   │   └── report_service.py
│   │   │
│   │   ├── ai/
│   │   │   ├── model_loader.py
│   │   │   ├── predict.py
│   │   │   ├── preprocess.py
│   │   │   └── postprocess.py
│   │   │
│   │   ├── utils/
│   │   │   ├── file_utils.py
│   │   │   ├── raster_utils.py
│   │   │   └── response_utils.py
│   │   │
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── outputs/
│   ├── models/
│   │   └── land_classification_model.pth
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   ├── satelliteApi.js
│   │   │   └── predictionApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── MapViewer.jsx
│   │   │   ├── UploadPanel.jsx
│   │   │   ├── PredictionPanel.jsx
│   │   │   ├── LayerControl.jsx
│   │   │   ├── StatisticsPanel.jsx
│   │   │   └── HistoryTable.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── PredictionPage.jsx
│   │   │   └── HistoryPage.jsx
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml
├── README.md
└── .env.example