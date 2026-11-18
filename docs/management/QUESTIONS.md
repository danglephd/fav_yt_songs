# Câu hỏi đang mở

Các câu hỏi dưới đây giữ lại những điểm ảnh hưởng đến route, business behavior hoặc dữ liệu. Actual behavior trong docs phản ánh source hiện tại; không được hiểu là quyết định về intended behavior.

## Q-001: Route chính của giao diện mới

- **Câu hỏi:** Giao diện `MySongs2Component` nên được mở tại `/` hay `/my-songs-2`?
- **Lý do:** Đặc tả cũ trong `Manual2.md` từng chỉ định `/my-songs-2`, khác với route hiện tại trong `app.module.ts`.
- **Mức độ:** Cao.
- **Liên quan:** Routing, README, AI setup guide, My Songs.
- **Trạng thái:** Resolved.
- **Trả lời / kết quả:** `MySongs2Component` là màn hình chính tại `/`. `/my-songs-2` tiếp tục trỏ tới `MySongsComponent` cũ. Quyết định này chỉ cập nhật tài liệu; không thay đổi code.

## Q-002: Kết hợp Include và Require

- **Câu hỏi:** Khi đồng thời có filter `include` và `require`, nhóm nào quyết định điều kiện khớp?
- **Lý do:** Đặc tả cũ mô tả Include và Require cùng áp dụng, trong khi người dùng xác nhận Require phải thay thế Include khi có mặt.
- **Mức độ:** Cao.
- **Liên quan:** Business rules, tìm kiếm/lọc tags, [song-library.md](../features/song-library.md).
- **Trạng thái:** Resolved.
- **Trả lời / kết quả:** Nếu có ít nhất một `require`, chỉ cần thỏa mãn tất cả `require` và bỏ qua `include`. Nếu không có `require` nhưng có `include`, phải thỏa ít nhất một `include`. `exclude` luôn loại bài hát nếu có bất kỳ tag nào khớp. Không có `include` và `require` thì hai nhóm này không giới hạn kết quả. Code không được cập nhật theo quyết định này trong nhiệm vụ hiện tại.

## Q-003: Nguồn dữ liệu chuẩn và đồng bộ Firebase

- **Câu hỏi:** Sau khi khởi tạo danh sách, ứng dụng có tiếp tục đồng bộ với Firebase hay hoạt động độc lập trên `localStorage`?
- **Lý do:** Cần xác định liệu Firebase là nguồn dữ liệu runtime hay chỉ là nguồn snapshot khởi tạo.
- **Mức độ:** Cao.
- **Liên quan:** Persistence, data model, import, delete, deployment.
- **Trạng thái:** Resolved.
- **Trả lời / kết quả:** Nếu `cachedSongs` có ít nhất một record hợp lệ, chỉ dùng local và không gọi Firebase. Nếu cache thiếu, rỗng hoặc không hợp lệ, hỏi người dùng; nếu đồng ý, lấy snapshot `/songs` một lần, ghi cache và unsubscribe. Thay đổi remote không cập nhật localStorage, thay đổi local không ghi ngược lên Firebase. Từ chối, lỗi, snapshot rỗng hoặc cache bị xóa/hỏng cho phép hỏi/nạp lại ở lần mở sau.

## Q-004: Giá trị mặc định của kích thước playlist

- **Câu hỏi:** Giá trị mặc định mong muốn của `maxPlaylistSize` là 30 hay 50?
- **Lý do:** Settings dialog và player trước đây có giá trị mặc định khác nhau.
- **Mức độ:** Trung bình.
- **Liên quan:** Settings, playback playlist.
- **Trạng thái:** Resolved.
- **Trả lời / kết quả:** Dùng 30 làm mặc định thống nhất cho Settings initialization, fallback khi chưa có giá trị lưu, Reset và player. Giá trị tùy chỉnh đã lưu của người dùng tiếp tục được giữ nguyên.

## Q-005: Warning budget của stylesheet My Songs 2

- **Câu hỏi:** Có nên tối ưu `my-songs-2.component.css` xuống dưới warning budget 10 kB, hay tăng warning budget để phù hợp với kích thước hiện tại?
- **Lý do:** Production build báo stylesheet khoảng 18.21 kB, vượt warning budget 10 kB nhưng vẫn dưới error budget 20 kB; build và deploy vẫn có thể hoàn tất.
- **Mức độ:** Trung bình.
- **Liên quan:** CSS My Songs 2, production build, [angular.json](../../angular.json).
- **Trạng thái:** Open.
- **Trả lời / kết quả:** Chưa có quyết định. Chưa tối ưu stylesheet hoặc thay đổi warning/error budget.