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

- **Câu hỏi:** Sau khi khởi tạo danh sách, ứng dụng có tiếp tục đồng bộ với Firebase hay hoạt động độc lập trên `localStorage`?
- **Lý do:** Cần xác định liệu Firebase là nguồn dữ liệu runtime hay chỉ là nguồn snapshot khởi tạo.
- **Mức độ:** Cao.
- **Liên quan:** Persistence, data model, import, delete, deployment.
- **Trạng thái:** Resolved.
- **Trả lời / kết quả:** Nếu `cachedSongs` có ít nhất một record hợp lệ, chỉ dùng local và không gọi Firebase. Nếu cache thiếu, rỗng hoặc không hợp lệ, hỏi người dùng; nếu đồng ý, lấy snapshot `/songs` một lần, ghi cache và unsubscribe. Thay đổi remote không cập nhật localStorage, thay đổi local không ghi ngược lên Firebase. Từ chối, lỗi, snapshot rỗng hoặc cache bị xóa/hỏng cho phép hỏi/nạp lại ở lần mở sau.

## Q-004: Giá trị mặc định của kích thước playlist

- **Câu hỏi:** Giá trị mặc định mong muốn của `maxPlaylistSize` là 30 hay 50?
- **Lý do:** Settings dialog khởi tạo 50; player đặt và lưu 30 nếu mở khi chưa có giá trị trong localStorage.
- **Mức độ:** Trung bình.
- **Liên quan:** Settings, playback playlist.
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có xác nhận. Tài liệu nêu rõ hai giá trị hiện tại; chưa đổi mặc định.