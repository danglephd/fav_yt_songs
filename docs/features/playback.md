# Playback và cài đặt

**Trạng thái:** Implemented tại route `/`.

Nguồn chính: [video-player-dialog.component.ts](../../src/app/video-player-dialog/video-player-dialog.component.ts), [video-player-dialog.component.html](../../src/app/video-player-dialog/video-player-dialog.component.html), [settings-dialog.component.ts](../../src/app/settings-dialog/settings-dialog.component.ts), [playback-sound.service.ts](../../src/app/services/playback-sound.service.ts).

## Phát danh sách

- Player dùng YouTube IFrame API và nhận danh sách bài đã lọc cùng vị trí bắt đầu.
- Playlist bị giới hạn bởi `maxPlaylistSize`; giá trị tùy chỉnh được đọc từ localStorage. Nếu chưa lưu, mặc định thống nhất là 30.
- Khi shuffle tắt, danh sách được xoay để bài đang chọn đứng đầu, các bài trước đó chuyển xuống cuối; player bắt đầu ở index 0.
- Khi shuffle bật, bài đang chọn được giữ đầu danh sách và các bài còn lại được xáo trộn.
- Tự phát bài tiếp theo được bật khi màn hình mở player. Loop được áp dụng qua YouTube player.
- Các thao tác điều khiển phát có thể chịu giới hạn, lỗi nhúng hoặc chính sách của YouTube/browser.

## Tiến độ phát

Tiến độ chỉ lưu cho bài được nhận diện bằng tag `playlist`. Player ghi vào `localStorage.playlistPlaybackProgress` khi đang phát theo chu kỳ 15 giây, khi pause, chuyển video, đóng player và trước `pagehide`. Khi video kết thúc hoặc gặp lỗi phù hợp, tiến độ của video đó bị xóa.

Từ thư viện, bài playlist có thể tiếp tục từ tiến độ còn hiệu lực hoặc phát lại từ đầu. Tiến độ gần cuối video được xem là đã hoàn tất và không dùng để resume.

## Lỗi và bài không khả dụng

Với YouTube error code 100, 101 hoặc 150, player phát âm báo lỗi, xóa tiến độ, đánh dấu bài `unavailable` trong local cache và chuyển theo hướng next/previous hiện hành. Bài unavailable không mở trong player từ thư viện.

## Cài đặt

Dialog Settings lưu `shuffleEnabled`, `loopEnabled` và `maxPlaylistSize` vào localStorage. Giá trị mặc định là shuffle off, loop off và playlist size 30. Reset khôi phục cùng các mặc định này. Giá trị `maxPlaylistSize` đã được người dùng lưu vẫn được giữ nguyên.

## Âm thanh trạng thái

`PlaybackSoundService` dùng Web Audio API để phát pattern Morse cho chuyển track, quay vòng playlist, kết thúc playlist và một số lỗi phát video. Chi tiết các điều kiện gọi hiện có trong [PlaybackSound.md](../../PlaybackSound.md); tài liệu đó là mô tả chi tiết bổ sung, không thay thế source code.