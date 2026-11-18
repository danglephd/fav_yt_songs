# Thư viện bài hát

**Trạng thái:** Implemented tại route `/`.

Nguồn chính: [my-songs-2.component.ts](../../src/app/my-songs-2/my-songs-2.component.ts), [my-songs-2.component.html](../../src/app/my-songs-2/my-songs-2.component.html), [song.realtimedb.service.ts](../../src/app/services/song.realtimedb.service.ts).

## Mục đích

Hiển thị danh sách video đã lưu, cho phép tìm theo tags, lọc theo tag, mở player và xóa một mục khỏi thư viện local.

## Nạp danh sách

1. Nếu `localStorage.cachedSongs` có dữ liệu khác `[]`, màn hình đọc danh sách từ cache, bỏ các mục có `deleted: true` và sắp xếp theo `createdAt` giảm dần.
2. Nếu chưa có cache, ứng dụng hỏi người dùng có muốn đọc danh sách từ Firebase Realtime Database hay không.
3. Khi chấp nhận, `SongRealtimedbService.getActiveSongs()` đọc `/songs`, lọc mục chưa xóa, sắp xếp mới nhất trước và kết quả được lưu vào cache local.
4. Nếu từ chối, màn hình dừng ở trạng thái không có danh sách. Lỗi đọc sẽ hiện thông báo lỗi.

Cache có dữ liệu được ưu tiên hơn Firebase; màn hình hiện hành không tự làm mới cache từ remote trong lần nạp đó.

## Tìm kiếm và lọc tags

Ô `Search songs...` thực tế phân tích query thành các từ/tag; không tìm theo title hoặc channel. Tag được chuẩn hóa trước khi so khớp, so khớp theo `contains`.

- Query hỗ trợ token không trích dẫn và cụm từ trong dấu ngoặc kép; các token trùng sau chuẩn hóa chỉ giữ một.
- Mỗi token mặc định có trạng thái `include`. Nhấn badge chuyển lần lượt `include → require → exclude → include`; nút đóng riêng bỏ token khỏi query.
- `exclude` loại bài có bất kỳ tag nào chứa token đó.
- Khi không có `require`, các token `include` được kết hợp OR.
- Khi có ít nhất một `require`, implementation chỉ kiểm tra tất cả token `require` sau bước loại `exclude`; các token `include` không còn giới hạn kết quả.
- Nếu không còn điều kiện `include`/`require` (ví dụ chỉ có `exclude`), mọi bài không bị loại được giữ lại.

Đặc tả [Manual2.md](../../Manual2.md) nói `include OR` phải đồng thời thỏa `require AND`; điều này khác nhánh xử lý hiện tại. Chưa tự đổi business rule; xem [Q-002](../management/QUESTIONS.md).

## Tags panel

- Danh sách tag được tạo từ dữ liệu tags của các bài hiện có; mỗi tag chỉ được đếm một lần cho mỗi bài.
- Search Tags lọc tên tag theo `contains` sau chuẩn hóa.
- Có bốn thứ tự: số lượng tăng/giảm và alphabet tăng/giảm.
- Nhấn tag trong panel sẽ thêm tag vào query; nhấn lại tag đã chọn sẽ bỏ tag đó. Chuyển ba trạng thái được thực hiện trên badge của query.
- Nút `All Songs` xóa query và các filter.
- Tag counts được tính từ toàn bộ danh sách đã nạp, không từ kết quả hiện đang lọc.
- Trên viewport dưới 600px, panel mở bằng thao tác vuốt ngang từ mép trái (gesture bắt đầu trong vùng x khoảng 24–160px); đóng bằng nút close, overlay hoặc Escape.

## Danh sách và phân trang

- Desktop hiển thị cột Title, Channel, Tags, Added và Actions; mobile ẩn một số cột và hiển thị channel/tags dưới title.
- Theme sáng/tối được chọn theo `prefers-color-scheme` của hệ điều hành; hiện không có nút đổi theme trong màn hình.
- Trên mobile, vuốt hàng bài hát sang trái hơn ngưỡng 80px sẽ gọi thao tác xóa sau bước xác nhận.
- Bài có `unavailable` không mở player; nhấn hàng sẽ mở YouTube link bên ngoài nếu có.
- Nhấn hàng hoặc nút play mở player. Với bài được nhận diện là playlist và có tiến độ lưu hợp lệ, playback tiếp tục từ tiến độ đó; nút replay mở từ đầu.
- Trang mặc định có 20 hàng; lựa chọn 10, 20 hoặc 50. Filter và đổi page size đưa về trang đầu.
- Bộ đếm hiển thị tổng số bài sau lọc; footer hiển thị khoảng hàng và điều khiển trang.

## Xóa bài

Xóa cần xác nhận. Màn hình ghi `deleted: true` vào mục trong `localStorage.cachedSongs`, sau đó loại bài khỏi danh sách đang hiển thị. Không có thao tác ghi Firebase trong luồng này. Việc đồng bộ xóa lên remote là câu hỏi mở [Q-003](../management/QUESTIONS.md).