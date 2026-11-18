# Quyết định

## D-001: Quy tắc sắp xếp và ghi nhận playCount

- **Ngày:** 2026-11-18.
- **Quyết định:** Trong giao diện My Songs 2, `playCount` tăng dần là tiêu chí sắp xếp chính; `createdAt` giảm dần là tiêu chí phụ. Priority cao hơn chạy trước. Giá trị `playCount` chưa có được xếp trước các giá trị đã có. Chỉ tăng count khi YouTube player xác nhận video bắt đầu phát (`PLAYING`); mở player mà video không phát thì không tính. Mỗi lượt playback được tính một lần, không tính lại khi pause/resume; bài tiếp theo hoặc phát lại sau khi kết thúc được tính thêm. Bài chưa có count bắt đầu ở 1. Count được lưu vào `localStorage.cachedSongs`, không ghi Firebase. Danh sách không được sắp xếp lại ngay sau khi count vừa cập nhật.
- **Phạm vi:** Sắp xếp kết quả sau tag filtering và trước pagination tại route `/`.
- **Liên quan:** [song-library.md](../features/song-library.md), [data-and-integrations.md](../architecture/data-and-integrations.md), `SongSortingService`.

## D-002: Khởi tạo Firebase một lần rồi local-only

- **Ngày:** 2026-11-18.
- **Quyết định:** Nếu `localStorage.cachedSongs` có record hợp lệ thì chỉ dùng local, không gọi Firebase. Nếu cache thiếu/rỗng/không hợp lệ, hỏi người dùng; khi đồng ý, lấy một snapshot duy nhất, lưu vào localStorage rồi unsubscribe. Không nhận cập nhật realtime và không ghi dữ liệu local lên Firebase. Snapshot rỗng hoặc cache bị xóa/hỏng khiến lần mở sau có thể hỏi/nạp lại.
- **Phạm vi:** Nạp danh sách ở hai màn hình My Songs; persistence sau khởi tạo hoạt động bằng localStorage.
- **Liên quan:** [song-library.md](../features/song-library.md), [data-and-integrations.md](../architecture/data-and-integrations.md), [Q-003](QUESTIONS.md#q-003-nguồn-dữ-liệu-chuẩn-và-đồng-bộ-firebase).

## D-003: Quy tắc kết hợp Include, Require và Exclude

- **Ngày:** 2026-11-18.
- **Quyết định:** Khi có `require`, kết quả phải thỏa tất cả `require`, còn `include` bị bỏ qua. Nếu không có `require` nhưng có `include`, kết quả phải thỏa ít nhất một `include`. `exclude` luôn loại bài có bất kỳ tag nào khớp. Nếu không có `include` và `require`, hai nhóm này không giới hạn kết quả.
- **Phạm vi:** Business rules lọc tags cho My Songs.
- **Liên quan:** [QUESTIONS.md](QUESTIONS.md#q-002-kết-hợp-include-và-require), [song-library.md](../features/song-library.md), [Manual2.md](../../Manual2.md).
- **Lưu ý:** Đây là quyết định intended behavior. Code hiện tại không được cập nhật trong nhiệm vụ ghi nhận quyết định này.

## D-004: Route chính của My Songs 2

- **Ngày:** 2026-11-18.
- **Quyết định:** `MySongs2Component` là giao diện chính tại `/`; `/my-songs-2` vẫn mở `MySongsComponent` cũ.
- **Phạm vi:** Tài liệu và định hướng route của ứng dụng. Code hiện tại đã có ánh xạ này và không được thay đổi trong lần cập nhật tài liệu.
- **Liên quan:** [QUESTIONS.md](QUESTIONS.md#q-001-route-chính-của-giao-diện-mới), [docs overview](../README.md), [Manual2.md](../../Manual2.md).

## D-005: Mặc định kích thước playlist

- **Ngày:** 2026-11-18.
- **Quyết định:** Mặc định `maxPlaylistSize` là 30, thống nhất ở Settings initialization, fallback, Reset và player. Giá trị tùy chỉnh đã lưu trong localStorage không bị ghi đè.
- **Phạm vi:** Giá trị mặc định khi chưa có cài đặt đã lưu và thao tác Reset Settings.
- **Liên quan:** [QUESTIONS.md](QUESTIONS.md#q-004-giá-trị-mặc-định-của-kích-thước-playlist), [playback.md](../features/playback.md), [Manual2.md](../../Manual2.md).

Các câu hỏi chưa được quyết định tiếp tục được theo dõi tại [QUESTIONS.md](QUESTIONS.md). Q-001, Q-002, Q-003 và Q-004 đã được giải quyết bằng D-004, D-003, D-002 và D-005 tương ứng.