# YÊU CẦU CODEX: XỬ LÝ CẮT ẢNH 0.3KM × 0.3KM TRƯỚC KHI ĐƯA VÀO MODEL VÀ HIỂN THỊ MASK PHÂN LOẠI ĐẤT

Hãy bổ sung và chỉnh sửa hệ thống phân loại đất từ ảnh vệ tinh theo yêu cầu sau:

## 1. Mục tiêu chính

Hệ thống phải xử lý ảnh vệ tinh theo đúng pipeline:

```txt
Chọn khu vực trên bản đồ
        ↓
Lấy ảnh vệ tinh từ Google Earth Engine
        ↓
Cắt khu vực thành nhiều tile 0.3km × 0.3km
        ↓
Đưa từng tile vào model AI
        ↓
Sinh mask phân loại đất cho từng tile
        ↓
Ghép các mask lại theo đúng vị trí địa lý
        ↓
Hiển thị kết quả mask trên bản đồ