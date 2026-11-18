# PlaybackSound: danh sách và thời điểm phát âm thanh

Tính năng này được triển khai qua `PlaybackSoundService` trong [src/app/services/playback-sound.service.ts](src/app/services/playback-sound.service.ts) và được dùng trong [src/app/video-player-dialog/video-player-dialog.component.ts](src/app/video-player-dialog/video-player-dialog.component.ts).

## 1. Cấu trúc service

`PlaybackSoundService` tạo âm thanh bằng Web Audio API theo kiểu Morse code:

- `prepare()`: kích hoạt audio context để browser cho phép phát âm thanh khi người dùng tương tác
- `play(sound)`: gọi đúng pattern tương ứng
- `patterns` map các loại âm thanh thành ký tự Morse:
  - `TrackChange` -> `E` -> `.` (một tiếng ngắn)
  - `PlaylistLoop` -> `I` -> `..` (hai tiếng ngắn)
  - `PlaylistEnd` -> `M` -> `--` (hai tiếng dài)
  - `PlayError` -> `O` -> `---` (ba tiếng dài)

Dữ liệu định nghĩa nằm trong [src/app/shared/models/playback-sound.types.ts](src/app/shared/models/playback-sound.types.ts).

## 2. Các loại âm thanh và ý nghĩa

### 2.1. `PlaybackSound.TrackChange`
- Mã: `TrackChange`
- Pattern Morse: `E` = `.`
- Mục đích: báo hiệu chuyển sang bài mới / thay đổi bài đang phát
- Thời điểm phát: trong `detectVideoChange(videoId)`
- Điều kiện phát:
  - video hiện tại thực sự thay đổi (`previousVideoId !== videoId`)
  - không phải là trường hợp lặp playlist theo vòng (playlist loop)
- Vị trí gọi:
  - `this.playbackSound.play(isPlaylistLoop ? PlaybackSound.PlaylistLoop : PlaybackSound.TrackChange);`

### 2.2. `PlaybackSound.PlaylistLoop`
- Mã: `PlaylistLoop`
- Pattern Morse: `I` = `..`
- Mục đích: báo hiệu khi playlist quay vòng từ cuối về đầu
- Thời điểm phát: cũng trong `detectVideoChange(videoId)` nhưng chỉ khi:
  - `loopEnabled === true`
  - `previousIndex === this.preparedPlaylist.length - 1`
  - `currentIndex === 0`
- Có nghĩa: người dùng vừa đi từ bài cuối của playlist quay về bài đầu, nên phát âm thanh riêng để phân biệt với chuyển bài bình thường.

### 2.3. `PlaybackSound.PlaylistEnd`
- Mã: `PlaylistEnd`
- Pattern Morse: `M` = `--`
- Mục đích: báo hiệu playlist đã kết thúc
- Thời điểm phát: trong `handlePlaylistEnded(videoId)`
- Điều kiện phát:
  - playlist đang ở bài cuối (`this.player.getPlaylistIndex() === this.preparedPlaylist.length - 1`)
  - `loopEnabled` đang tắt
  - sau khoảng 500ms kiểm tra lại trạng thái `ENDED` và video không đổi
- Đây là âm thanh phát khi “hết playlist”, không phải mỗi khi track kết thúc từng bài.

### 2.4. `PlaybackSound.PlayError`
- Mã: `PlayError`
- Pattern Morse: `O` = `---`
- Mục đích: báo hiệu lỗi phát video từ YouTube
- Thời điểm phát: trong `onPlayerError(event)`
- Điều kiện phát:
  - `event.data` thuộc các mã lỗi `[100, 101, 150]`
  - trước khi chuyển sang bài tiếp theo hoặc bài trước đó
- Khi gặp lỗi này, hệ thống sẽ:
  1. phát âm thanh lỗi
  2. xóa progress của bài hiện tại
  3. đánh dấu bài `unavailable`
  4. chuyển video bằng `nextVideo()` hoặc `previousVideo()` tùy `navigationDirection`

## 3. Khởi tạo ban đầu

Trong constructor của dialog, có gọi:

- `this.playbackSound.prepare();`

Nghĩa là khi mở dialog phát nhạc, service sẽ kích hoạt audio context sớm để có thể phát âm thanh mà không bị chặn bởi browser.

## 4. Tóm tắt thời điểm phát mẫu

- Chuyển bài mới: `TrackChange`
- Quay vòng playlist: `PlaylistLoop`
- Kết thúc toàn bộ playlist: `PlaylistEnd`
- Lỗi phát nhạc: `PlayError`

## 5. Gợi ý quyết định cập nhật

Nếu muốn điều chỉnh âm thanh, nên cập nhật theo các điểm sau:

1. Nếu muốn thay đổi “người dùng đã chuyển bài” -> chỉnh `TrackChange` trong `detectVideoChange()`.
2. Nếu muốn phân biệt “playlist lặp lại vòng” với “chuyển bài thông thường” -> chỉnh `PlaylistLoop`.
3. Nếu muốn có âm báo “kết thúc danh sách phát” rõ hơn -> chỉnh `PlaylistEnd` trong `handlePlaylistEnded()`.
4. Nếu muốn cảnh báo khi YouTube không phát được video -> chỉnh `PlayError` trong `onPlayerError()`.

## 6. Kết luận

Tính năng `playbackSound` không phát ngẫu nhiên, mà được gắn chặt với các sự kiện lifecycle của video player:

- `detectVideoChange()` => âm thanh chuyển bài / vòng loop
- `handlePlaylistEnded()` => âm thanh kết thúc playlist
- `onPlayerError()` => âm thanh lỗi phát

Đây là cơ sở tốt để quyết định thời điểm cập nhật âm thanh sau này nếu cần làm mới UX hoặc thay đổi nhịp điệu, âm lượng, hoặc loại hiệu ứng âm thanh.