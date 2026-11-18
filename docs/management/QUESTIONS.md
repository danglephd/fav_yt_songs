# Câu hỏi đang mở

Các câu hỏi dưới đây giữ lại những điểm ảnh hưởng đến route, business behavior hoặc dữ liệu. Actual behavior trong docs phản ánh source hiện tại; không được hiểu là quyết định về intended behavior.

## Q-001: Route chính của giao diện mới

- **Câu hỏi:** Giao diện `MySongs2Component` nên được mở tại `/` hay `/my-songs-2`?
- **Lý do:** `Manual2.md` yêu cầu mở giao diện mới tại `/my-songs-2`; `app.module.ts` hiện ánh xạ `/` tới `MySongs2Component` và `/my-songs-2` tới `MySongsComponent` cũ.
- **Mức độ:** Cao.
- **Liên quan:** Routing, README, AI setup guide, My Songs.
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có xác nhận. Source hiện tại được mô tả nguyên trạng; không đổi route trong nhiệm vụ tài liệu này.

## Q-002: Kết hợp Include và Require

- **Câu hỏi:** Khi đồng thời có filter `include` và `require`, có phải kết quả cần thỏa `(ít nhất một include) AND (tất cả require)` ngoài điều kiện exclude?
- **Lý do:** `Manual2.md` mô tả phép kết hợp này. `MySongs2Component.applyFilters()` trả về theo `requires.every(...)` ngay khi có require, nên các include không giới hạn kết quả trong nhánh đó.
- **Mức độ:** Cao.
- **Liên quan:** Business rules, tìm kiếm/lọc tags, [song-library.md](../features/song-library.md).
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có xác nhận. Tài liệu ghi actual behavior, chưa sửa logic lọc.

## Q-003: Nguồn dữ liệu chuẩn và đồng bộ Firebase

- **Câu hỏi:** Thêm/xóa bài trên giao diện hiện hành có cần ghi đồng bộ vào Firebase Realtime Database `/songs`, hay `localStorage` là nơi lưu trữ chủ đích?
- **Lý do:** Route `/` nạp Firebase chỉ khi chưa có cache; luồng thêm/xóa hiện chỉ sửa `localStorage.cachedSongs`. Điều này khác phát biểu cũ trong `AI_SETUP_GUIDE.md` rằng màn hình đọc và ghi `/songs`.
- **Mức độ:** Cao.
- **Liên quan:** Persistence, data model, import, delete, deployment.
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có xác nhận. Docs mô tả nơi đọc/ghi thực tế, không khẳng định local-only là yêu cầu sản phẩm.

## Q-004: Giá trị mặc định của kích thước playlist

- **Câu hỏi:** Giá trị mặc định mong muốn của `maxPlaylistSize` là 30 hay 50?
- **Lý do:** Settings dialog khởi tạo 50; player đặt và lưu 30 nếu mở khi chưa có giá trị trong localStorage.
- **Mức độ:** Trung bình.
- **Liên quan:** Settings, playback playlist.
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có xác nhận. Tài liệu nêu rõ hai giá trị hiện tại; chưa đổi mặc định.