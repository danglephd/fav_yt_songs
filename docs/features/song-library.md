# Thư viện bài hát

**Trạng thái:** Implemented tại route `/`.

Nguồn chính: [my-songs-2.component.ts](../../src/app/my-songs-2/my-songs-2.component.ts), [my-songs-2.component.html](../../src/app/my-songs-2/my-songs-2.component.html), [song.realtimedb.service.ts](../../src/app/services/song.realtimedb.service.ts).

## Mục đích

Hiển thị danh sách video đã lưu, cho phép tìm theo tags, lọc theo tag, mở player và xóa một mục khỏi thư viện local.

## Nạp danh sách
1. Nếu `localStorage.cachedSongs` là JSON array có ít nhất một record hợp lệ (có `id`, `videoId`, `title` dạng chuỗi), màn hình chỉ đọc cache và bỏ các mục có `deleted: true`. Nhánh này không gọi Firebase.
2. Nếu cache thiếu, rỗng, sai JSON/schema hoặc không có record hợp lệ, ứng dụng hỏi người dùng có muốn nạp dữ liệu từ Firebase Realtime Database hay không.
3. Nếu đồng ý, `SongRealtimedbService.getActiveSongs()` lấy một snapshot duy nhất từ `/songs`, lọc mục chưa xóa, sắp xếp mới nhất trước và ghi kết quả vào cache. `take(1)` kết thúc subscription sau snapshot đầu tiên.
4. Nếu từ chối, ứng dụng không đọc Firebase; lần mở sau có thể hỏi lại. Nếu lần đọc lỗi, ứng dụng báo lỗi và có thể thử lại ở lần mở sau.

Sau khi snapshot có dữ liệu hợp lệ trong cache, các lần mở tiếp theo chỉ dùng localStorage. Thay đổi Firebase về sau không được nhận và cache không bị ghi đè. Add, delete, playCount và các cập nhật cache khác chỉ tồn tại local. Nếu snapshot rỗng hoặc cache bị xóa/hỏng/hết record hợp lệ, lần mở sau xem như không có dữ liệu local và có thể hỏi/nạp lại snapshot.

Khi snapshot được nạp từ Realtime Database, tag của từng bài được tạo lại một lần từ metadata hiện có (`title`, `channel`, `description`, `durationSeconds`), kể cả khi record nguồn đã có đầy đủ tag fields. Kết quả mới thay thế tag fields cũ và được cập nhật vào local cache sau khi xử lý xong. Cờ `unavailable` được giữ lại. Quy tắc regenerate này không áp dụng khi nạp cache hoặc khi add song.

## Thứ tự bài hát

Sau khi áp dụng tag filters, `SongSortingService` sắp xếp kết quả theo `playCount` tăng dần làm tiêu chí chính, rồi `createdAt` giảm dần làm tiêu chí phụ. Bài chưa có `playCount` được xem là null và đứng trước bài có count. Thứ tự này được áp dụng trước khi phân trang.

`playCount` chỉ tăng khi YouTube player xác nhận video đã bắt đầu phát qua trạng thái `PLAYING`; chỉ mở player nhưng video không phát thì không tăng. Mỗi lượt playback chỉ được tính một lần, nên pause/resume không tăng lại; bài tiếp theo hoặc phát lại sau khi kết thúc có thể được tính thêm. Bài chưa có count bắt đầu từ 1. Count được ghi vào `localStorage.cachedSongs`; không đồng bộ lên Firebase.

Sau khi cập nhật count, thứ tự danh sách không đổi ngay. Sắp xếp theo count mới được áp dụng ở lần kế tiếp danh sách được lọc/sắp xếp, chẳng hạn khi filter thay đổi hoặc dữ liệu được nạp lại.

## Tìm kiếm và lọc tags

Ô `Search songs...` thực tế phân tích query thành các từ/tag; không tìm theo title hoặc channel. Tag được chuẩn hóa trước khi so khớp, so khớp theo `contains`.

- Query hỗ trợ token không trích dẫn và cụm từ trong dấu ngoặc kép; các token trùng sau chuẩn hóa chỉ giữ một.
- Mỗi token mặc định có trạng thái `include`. Nhấn badge chuyển lần lượt `include → require → exclude → include`; nút đóng riêng bỏ token khỏi query.
- `exclude` loại bài có bất kỳ tag nào chứa token đó.
- Nếu có ít nhất một `require`, kết quả phải thỏa tất cả token `require`; token `include` bị bỏ qua.
- Nếu không có `require` nhưng có `include`, kết quả phải thỏa ít nhất một token `include`.
- `exclude` luôn có hiệu lực và loại bài nếu bất kỳ tag nào chứa token exclude.
- Nếu không có `include` và `require`, hai nhóm này không giới hạn kết quả; `exclude` vẫn được áp dụng nếu có.

Đây là quy tắc intended behavior đã được xác nhận trong [D-003](../management/DECISIONS.md). Implementation hiện tại tại `MySongs2Component.applyFilters()` loại các bài khớp `exclude` trước, sau đó nếu có `require` thì yêu cầu tất cả `require` và bỏ qua `include`; nếu không có `require` thì áp dụng `include` theo OR. Vì vậy code hiện tại đã khớp quyết định này; không có thay đổi code trong lần cập nhật tài liệu.

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
- Pagination có nút về trang đầu, trang trước, các số trang gần hiện tại, trang sau và trang cuối; nút đầu/cuối bị disable khi đã ở biên tương ứng.
- Bộ đếm hiển thị tổng số bài sau lọc; footer hiển thị khoảng hàng và điều khiển trang.

## Xóa bài

Xóa cần xác nhận. Màn hình ghi `deleted: true` vào mục trong `localStorage.cachedSongs`, sau đó loại bài khỏi danh sách đang hiển thị. Không có thao tác ghi Firebase trong luồng này; đây là hành vi local-only đã được xác nhận.