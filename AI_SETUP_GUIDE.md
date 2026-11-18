# AI Setup Guide

## Phạm vi ứng dụng

Đây là ứng dụng Angular 13 có hai màn hình My Songs. Route `/` mở `MySongs2Component` (giao diện hiện hành); route `/my-songs-2` mở `MySongsComponent` (giao diện cũ). Các route được khai báo trong [app.module.ts](src/app/app.module.ts). Không xem project này là bản standalone chỉ chứa `my-songs`.

Tài liệu sản phẩm và các điểm chưa được xác nhận nằm trong [docs/README.md](docs/README.md).

## Cài đặt và chạy

1. Dùng Node.js tương thích với Angular CLI 13 và cài dependencies bằng `npm install` hoặc `yarn install`.
2. Cấu hình Firebase và YouTube API trong `src/environments/environment.ts` cho môi trường local. Không commit hoặc in API keys.
3. Chạy `npm start`; Angular CLI sẽ hiển thị địa chỉ development server.
4. Lệnh production build có sẵn là `npm run build1` (tương đương `ng build --configuration production`). Chỉ chạy khi cần xác minh build hoặc theo yêu cầu trong [AGENTS.md](AGENTS.md).

Firebase Realtime Database rules, quyền truy cập database, YouTube Data API key và quota là điều kiện ngoài source code. Build thành công không xác minh các điều kiện này.

## Ranh giới source

- Màn hình: `src/app/my-songs-2` và `src/app/my-songs`.
- Dialogs: `src/app/add-youtube-song-dialog`, `src/app/video-player-dialog`, `src/app/settings-dialog`.
- Services: `src/app/services`.
- Models: `src/app/models` và `src/app/shared/models`.
- Angular routes, declarations và providers: `src/app/app.module.ts`.
- Firebase/YouTube config: `src/environments`.

## Hành vi dữ liệu cần lưu ý

Ở màn hình `/`, danh sách được đọc từ `localStorage` khi đã có cache; nếu chưa có cache, người dùng được hỏi trước khi đọc `/songs` từ Firebase. Thêm bài và xóa bài trên màn hình hiện hành chỉ cập nhật cache local. Việc đồng bộ các thay đổi này trở lại Firebase chưa được xác nhận; xem [QUESTIONS.md](docs/management/QUESTIONS.md).

## Nguyên tắc thay đổi

- Giữ Angular 13 và contracts hiện có giữa components, dialogs, services và models.
- Kiểm tra tài liệu trong `docs/` và các câu hỏi liên quan trước khi thay đổi business behavior.
- Không sửa các tài liệu lịch sử/đặc tả cũ như thể chúng phản ánh implementation hiện tại nếu chưa đối chiếu source.
- Với thay đổi nhỏ trong template, CSS hoặc TypeScript, dựa vào Angular development server đang chạy theo [AGENTS.md](AGENTS.md); không tự khởi động server thứ hai hoặc chạy production build sau mỗi lần sửa.
