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

Các câu hỏi chưa được quyết định tiếp tục được theo dõi tại [QUESTIONS.md](QUESTIONS.md). Q-003 đã được giải quyết bằng D-002.