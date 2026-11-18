FINAL SPECIFICATION · VERSION 3.0

# My Songs – Responsive UI Design

Giữ nguyên my-songs
Viết trang my-songs-2, mở ở: http://localhost:4200/
Đặc tả giao diện Desktop & Mobile, Light Mode & Dark Mode

## 1. Mục tiêu thiết kế

Thiết kế giao diện My Songs để duyệt, tìm kiếm và lọc các bài hát YouTube theo Tags, giữ nguyên các chức năng hiện có và tối ưu trải nghiệm trên desktop lẫn mobile.

Nguyên tắc:

- Giao diện Clean Minimal, hiện đại, đơn giản.
- Ưu tiên hiển thị danh sách bài hát.
- Không bổ sung tính năng quản lý phát nhạc.
- Không sử dụng checkbox chọn bài hát.
- Nhấn vào một bài hát sẽ mở bài hát đó, sử dụng logic phát nhạc hiện tại.
- Không hiển thị nút Grid/Table trên mobile.
- Không hiển thị nút Tags trên mobile; dùng thao tác vuốt từ cạnh trái.
- Thanh Tags đang lọc cuộn ngang.
- Nút Add Song luôn dễ truy cập.
- Light Mode và Dark Mode sử dụng hai file CSS riêng.

## 2. Bố cục tổng thể

### 2.1. Desktop

Giữ cấu trúc gốc:

| Khu vực           | Nội dung                                               |
| ----------------- | ------------------------------------------------------ |
| Header            | My Songs, Grid/Table, Add Song, Settings               |
| Sidebar trái      | Tags, Search Tags, All Songs, danh sách Tags và số bài |
| Toolbar           | Search Songs, Sort, Song Count                         |
| Selected Tags Bar | Các tag đang lọc và trạng thái                         |
| Song Table        | Title, Channel, Tags, Added, Actions                   |
| Footer            | Rows per page, Pagination                              |

Sidebar có thể thu gọn bằng nút `‹`.

### 2.2. Mobile

| Thứ tự | Khu vực           | Nội dung                     |
| ------ | ----------------- | ---------------------------- |
| 1      | Header            | My Songs, `+ Add`, Settings  |
| 2      | Search Toolbar    | Search Songs, Sort           |
| 3      | Selected Tags Bar | Các tag đang lọc, cuộn ngang |
| 4      | Song Count        | Tổng số bài phù hợp          |
| 5      | Song List         | Danh sách bài hát dạng hàng  |
| 6      | Footer            | Rows per page, Pagination    |

Không có thanh điều hướng dưới cùng, nút Tags, checkbox hay nút chuyển Grid/Table.

## 3. Header

- `My Songs` căn trái, font 20px, semibold.
- Nút `+ Add` căn phải, màu Primary, cao 40px, bo góc 10px.
- Settings dạng icon button 40×40px.
- Header cao khoảng 56–64px.
- Padding ngang 12–16px.
- Nền đồng nhất với theme hiện tại.

Trên desktop có thể hiển thị `+ Add Song`, trên mobile dùng `+ Add`.

## 4. Search Songs

### 4.1. Thiết kế

- Input chiếm phần lớn chiều ngang.
- Chiều cao 42px.
- Bo góc 10px.
- Icon Search bên trái.
- Placeholder `Search songs...`.
- Sort nằm bên phải, sử dụng icon button hoặc menu hiện có.
- Focus có viền Primary nhẹ.

### 4.2. Quy tắc tìm kiếm đã xác nhận

Search chỉ tìm trong tên Tags của bài hát.

Mỗi từ được phân tách bằng khoảng trắng là một điều kiện tìm kiếm độc lập.

| Thuộc tính        | Quy tắc                        |
| ----------------- | ------------------------------ |
| Phạm vi           | Chỉ tên Tags                   |
| Phân tách         | Theo khoảng trắng              |
| Kết hợp từ ở trạng thái Include | OR; xem precedence Include/Require/Exclude tại mục 9 |
| So khớp           | Contains                       |
| Chữ hoa/thường    | Không phân biệt                |
| Tag không tồn tại | Vẫn được tìm kiếm bình thường  |
| Input rỗng        | Không áp dụng điều kiện Search |

Ví dụ, nhập:

```
relax piano
```

Bài hát được tìm thấy nếu có ít nhất một tag chứa `relax` hoặc `piano`.

| Tags của bài hát            | Kết quả    |
| --------------------------- | ---------- |
| `['relaxing', 'chill']`     | Khớp       |
| `['piano', 'instrumental']` | Khớp       |
| `['relaxing', 'piano']`     | Khớp       |
| `['rock', 'pop']`           | Không khớp |
| `['Relax Music']`           | Khớp       |

Không tìm trong Title hoặc Channel.

## 5. Selected Tags Bar

Thanh hiển thị các tag đang được chọn để lọc.

### 5.1. Giao diện

- Nằm dưới Search Toolbar.
- Một hàng duy nhất, cuộn ngang.
- `display: flex`, `flex-wrap: nowrap`, `overflow-x: auto`.
- Ẩn scrollbar nhưng vẫn cho phép vuốt ngang.
- Chip không co lại hoặc xuống dòng.
- Khoảng cách giữa chip 6–8px.
- Khi không có tag được chọn, ẩn thanh để tiết kiệm diện tích.

### 5.2. Trạng thái Tags

relaxing

piano

rock

| Trạng thái | Màu     | Ý nghĩa                           |
| ---------- | ------- | --------------------------------- |
| Include    | Xanh lá | Chứa ít nhất một tag Include      |
| Require    | Cam     | Khi có Require, phải chứa tất cả tag Require; Include bị bỏ qua |
| Exclude    | Đỏ      | Không chứa bất kỳ tag Exclude nào |

Nhấn vào chip chuyển trạng thái theo chu kỳ:

`Include → Require → Exclude → Include`

Mỗi chip có nút `×` riêng để bỏ tag khỏi bộ lọc, không xóa tag khỏi dữ liệu.

## 6. Tags Panel

### 6.1. Desktop

- Sidebar cố định bên trái.
- Có thể thu gọn bằng nút `‹`.
- Hiển thị Search Tags, All Songs, danh sách tag và số lượng bài hát.

### 6.2. Mobile

Không có nút Tags trên giao diện chính.

- Vuốt từ cạnh trái sang phải để mở Tags Panel.
- Panel trượt từ trái sang.
- Chiều rộng `min(85vw, 320px)`.
- Có overlay mờ phía sau.
- Hiệu ứng khoảng 220ms.
- Đóng bằng nút `×`, nhấn ngoài panel hoặc vuốt ngược lại.
- Vùng nhận gesture cạnh trái khoảng 20–24px, cần tránh xung đột với điều hướng Back của trình duyệt/hệ điều hành.

### 6.3. Nội dung và hành vi

- Tiêu đề Tags.
- Search Tags để lọc danh sách tên tag.
- All Songs để xóa bộ lọc tag.
- Danh sách tag kèm số lượng bài hát duy nhất chứa tag đó.
- Nhấn tag chưa chọn: thêm vào bộ lọc ở trạng thái Include.
- Nhấn tag đã chọn: chuyển trạng thái Include → Require → Exclude.
- Thay đổi áp dụng ngay, không cần Apply.
- Số lượng cạnh tag không thay đổi theo Search Songs hoặc bộ lọc đang áp dụng.

## 7. Song List

### 7.1. Desktop

Giữ Table View theo cấu trúc gốc:

| Cột     | Nội dung                 |
| ------- | ------------------------ |
| Title   | Thumbnail và tên bài hát |
| Channel | Tên kênh YouTube         |
| Tags    | Các tag của bài hát      |
| Added   | Ngày thêm                |
| Actions | Menu `⋮`                 |

Không có checkbox.

Nhấn vào hàng bài hát sẽ mở bài hát. Các nút có thao tác riêng không kích hoạt sự kiện nhấn hàng.

### 7.2. Mobile

Mỗi bài hát là một hàng thông tin gọn:

- Thumbnail 56×56px, bo góc 8px.
- Title tối đa hai dòng. Rõ ràng, nhấn mạnh, nổi bật. Đây phải là phần được ưu ái nhất.
- Channel chữ nhỏ bên dưới.
- Tags hiển thị dưới Channel.
- Added hiển thị dạng ngày ngắn.
- Nút Delete gọi Action delete
- Không có checkbox hoặc các nút phát nhạc bổ sung.

CSS:

- Padding hàng 10–12px.
- Chiều cao linh hoạt, tối thiểu 76px.
- Đường phân cách mảnh.
- Không dùng shadow nặng cho từng hàng.
- Không cuộn ngang toàn trang.

## 8. Song Count và Pagination

Song Count hiển thị số bài hát phù hợp sau khi áp dụng tất cả điều kiện tìm kiếm và lọc.

Pagination giữ nguyên:

- Rows per page.
- First page, Previous, Next và Last page.
- Trang hiện tại và các trang lân cận.
- Nút First page bị disable tại trang đầu; nút Last page bị disable tại trang cuối.
- Khi thay đổi Search, Tags Filter hoặc Rows per page, trở về trang đầu.
- Trên màn hình hẹp, Footer có thể xuống hai hàng.

## 9. Quy tắc kết hợp bộ lọc

Tất cả điều kiện được kiểm tra trên tags của bài hát. `Exclude` luôn được áp dụng và loại bài hát nếu có ít nhất một tag chứa bất kỳ từ Exclude nào.

Sau khi áp dụng Exclude:

- Nếu có một hoặc nhiều từ `Require`, bài hát phải có tag khớp với tất cả từ Require. Các từ Include bị bỏ qua.
- Nếu không có từ Require nhưng có một hoặc nhiều từ `Include`, bài hát phải có tag khớp với ít nhất một từ Include.
- Nếu không có cả Require và Include, hai nhóm này không giới hạn kết quả.

| Điều kiện đang chọn | Quy tắc áp dụng |
| --- | --- |
| Có Exclude | Luôn loại bài hát nếu có bất kỳ tag nào thuộc Exclude |
| Có ít nhất một Require | Chỉ kiểm tra tất cả Require; bỏ qua Include |
| Không có Require, có Include | Phải khớp ít nhất một Include |
| Không có Require và Include | Không giới hạn theo hai nhóm này |

Ví dụ:

- Include: `relaxing`, `piano`
- Require: `instrumental`
- Exclude: `rock`

Kết quả cần thỏa `instrumental` và không được chứa `rock`; `relaxing`/`piano` bị bỏ qua vì có Require. Nếu bỏ Require, bài hát chỉ cần khớp `relaxing` hoặc `piano`, đồng thời vẫn không chứa `rock`.

## 10. Thiết kế Light Mode và Dark Mode

Hai theme dùng cùng bố cục và kích thước, chỉ khác màu sắc.

| Thành phần | Light Mode | Dark Mode |
| ---------- | ---------- | --------- |
| Background | `#F8FAFC`  | `#0B1220` |
| Surface    | `#FFFFFF`  | `#111C2E` |
| Input      | `#FFFFFF`  | `#1E293B` |
| Text chính | `#0F172A`  | `#F1F5F9` |
| Text phụ   | `#64748B`  | `#94A3B8` |
| Border     | `#E2E8F0`  | `#334155` |
| Primary    | `#4F46E5`  | `#6366F1` |
| Include    | `#16A34A`  | `#4ADE80` |
| Require    | `#EA580C`  | `#FB923C` |
| Exclude    | `#DC2626`  | `#F87171` |

### Quy chuẩn chung

| Thuộc tính             | Giá trị           |
| ---------------------- | ----------------- |
| Font                   | Roboto hoặc Inter |
| Font nội dung          | 14px              |
| Font tiêu đề           | 20px              |
| Border radius input    | 10px              |
| Border radius button   | 10px              |
| Border radius tag chip | 999px             |
| Padding trang mobile   | 12–16px           |
| Khoảng cách thành phần | 8–12px            |
| Animation              | 150–220ms         |
| Mobile breakpoint      | Dưới 600px        |
| Tablet breakpoint      | 600–959px         |
| Desktop breakpoint     | Từ 960px          |

## 11. Cấu trúc CSS Angular

```
my-songs-2/
├── my-songs-2.component.ts
├── my-songs-2.component.html
├── my-songs-2.component.css
├── my-songs-2-light.css
└── my-songs-2-dark.css
```

| File                     | Trách nhiệm                                        |
| ------------------------ | -------------------------------------------------- |
| `my-songs-2.component.css` | Layout, responsive, spacing, typography, animation |
| `my-songs-2-light.css`     | Màu sắc và CSS variables của Light Mode            |
| `my-songs-2-dark.css`      | Màu sắc và CSS variables của Dark Mode             |

Các CSS variables nên được khai báo trên theme class ở phần tử cha hoặc `:host`, sau đó dùng chung trong component CSS. Tránh sao chép layout vào hai file theme.

Ví dụ Light:

```
.theme-light {
  --songs-bg: #F8FAFC;
  --songs-surface: #FFFFFF;
  --songs-text: #0F172A;
  --songs-border: #E2E8F0;
  --songs-primary: #4F46E5;
}
```

Ví dụ Dark:

```
.theme-dark {
  --songs-bg: #0B1220;
  --songs-surface: #111C2E;
  --songs-text: #F1F5F9;
  --songs-border: #334155;
  --songs-primary: #6366F1;
}
```

## 12. Tiêu chí nghiệm thu

- Mobile có My Songs, Add Song, Settings.
- Không có checkbox trong Song List.
- Không hiển thị Grid/Table switcher trên mobile.
- Vuốt từ cạnh trái mở Tags Panel.
- Tags Panel đóng bằng vuốt, nút Close hoặc overlay.
- Selected Tags Bar cuộn ngang, không xuống dòng.
- Tag chuyển đúng ba trạng thái Include, Require, Exclude.
- Search tách từng từ, so khớp contains, không phân biệt hoa/thường và chỉ tìm trong tên Tags.
- Khi có Require, phải khớp tất cả Require và bỏ qua Include.
- Khi không có Require nhưng có Include, phải khớp ít nhất một Include.
- Exclude luôn loại bài có tag khớp.
- Song Count phản ánh đúng kết quả lọc.
- Pagination có Rows per page, First/Previous/Next/Last và trạng thái disable chính xác ở hai đầu.
- Light/Dark có hai file CSS riêng, không lặp lại layout.
- Giao diện không có cuộn ngang toàn trang.
- Giữ nguyên logic mở và phát bài hát hiện có.
