# Thêm video YouTube

**Trạng thái:** Implemented tại route `/`.

Nguồn chính: [add-youtube-song-dialog.component.ts](../../src/app/add-youtube-song-dialog/add-youtube-song-dialog.component.ts), [youtube.service.ts](../../src/app/services/youtube.service.ts), [my-songs-2.component.ts](../../src/app/my-songs-2/my-songs-2.component.ts).

## Thêm một video

1. Mở `Add Song` để mở dialog.
2. Nhập YouTube URL hoặc video ID 11 ký tự. URL được debounce 500ms trước khi kiểm tra và gọi YouTube Data API.
3. Khi lấy được thông tin video, dialog hiển thị nội dung xác nhận; người dùng chọn thêm để trả kết quả về màn hình.
4. Màn hình bỏ qua video nếu `videoId` đã có trong danh sách; nếu chưa có, tạo song record, sinh tags và thêm record vào `localStorage.cachedSongs`.

Thông tin lấy từ YouTube gồm video ID, title, channel, description, thumbnail, duration và view count khi API trả về. Lỗi API hoặc video không tìm thấy được hiển thị trong dialog.

## Thêm nhiều video

- Nhập danh sách video ID, mỗi ID một dòng.
- ID được trim, bỏ dòng rỗng, chỉ nhận chuỗi dài 11 ký tự và loại trùng trước khi gọi API.
- Tối đa 50 ID mỗi lần fetch.
- Người dùng có thể chọn từng video hoặc chọn tất cả, bỏ video khỏi danh sách, rồi thêm các mục đã chọn.
- Mục trùng với thư viện hiện tại không được thêm; kết quả báo số mục thêm và số mục trùng.

## Sinh tags

`YoutubeTagService` chuẩn hóa tags trước khi lưu và tạo các trường `tags`, `approvedTags`, `generatedTags`, `searchableText`. Bổ sung tags cho record cũ cũng có thể được thử khi nạp dữ liệu. Trạng thái tích hợp master tag database chưa được xác minh như một luồng đang hoạt động; xem [data và integrations](../architecture/data-and-integrations.md).

## Lưu trữ

Ở giao diện hiện hành, thêm video chỉ ghi vào local cache; đây không phải thao tác ghi vào Firebase. Ý định đồng bộ lâu dài được ghi tại [Q-003](../management/QUESTIONS.md).