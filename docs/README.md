# Tổng quan ứng dụng

## Ứng dụng là gì?

Fav YouTube Songs là ứng dụng Angular để duy trì một thư viện video YouTube, phân loại bằng tags, tìm kiếm/lọc danh sách và phát video theo danh sách hiện hành.

## Đối tượng và phạm vi

Ứng dụng hướng tới người dùng cá nhân muốn lưu và duyệt các video YouTube như một thư viện bài hát. Source hiện có hai màn hình My Songs, các dialog thêm video/cài đặt/phát video, tích hợp Firebase Realtime Database, YouTube Data API và lưu trữ local bằng `localStorage`.

## Trạng thái route hiện tại

- **Implemented:** `/` mở `MySongs2Component`.
- **Implemented:** `/my-songs-2` mở `MySongsComponent` cũ.
- **Implemented:** wildcard route chuyển về `/`.
- **Resolved:** route chính `/` đã được người dùng xác nhận cho `MySongs2Component`; [Manual2.md](../Manual2.md) được cập nhật theo quyết định này. Chi tiết tại [D-004](management/DECISIONS.md).

Nguồn xác minh: [app.module.ts](../src/app/app.module.ts), [my-songs-2.component.ts](../src/app/my-songs-2/my-songs-2.component.ts).

## Tính năng

Xem [chỉ mục tính năng](features/README.md) để đi từ danh sách tính năng tới đặc tả actual behavior.

## Kiến trúc và dữ liệu

- [Kiến trúc, tích hợp và data model](architecture/data-and-integrations.md)
- [Câu hỏi đang mở](management/QUESTIONS.md)
- [Quyết định đã xác nhận](management/DECISIONS.md)

## Quy ước xác minh

Tài liệu này phân biệt **Implemented** (đã xác minh trong source), **Partially implemented** (chỉ một phần luồng có implementation), **Planned** (ý định trong tài liệu, chưa xác minh có trong source) và **Unknown / Unverified** (chưa đủ căn cứ).

Mô tả tính năng nói về implementation hiện tại, không tự động coi tài liệu thiết kế cũ là hành vi đã triển khai. Các mâu thuẫn quan trọng được giữ thành câu hỏi mở cho đến khi có quyết định của người dùng.