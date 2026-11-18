# Kiến trúc, dữ liệu và tích hợp

**Trạng thái:** Mô tả implementation hiện tại đã kiểm tra trong source.

## Thành phần chính

- `AppModule` khai báo routes, hai màn hình My Songs, ba dialogs, Angular Material và Firebase modules.
- `MySongs2Component` là màn hình tại `/`; `MySongsComponent` là màn hình cũ tại `/my-songs-2`.
- `SongRealtimedbService` cung cấp luồng đọc danh sách active từ `/songs` và đọc cache browser.
- `YouTubeService` truy vấn YouTube Data API v3 để lấy metadata video.
- `YoutubeTagService`/`TagService` chuẩn hóa và tổng hợp tags cho tìm kiếm/hiển thị.
- `VideoPlayerDialogComponent` tạo YouTube IFrame player và quản lý playback/progress.

Nguồn route/module: [app.module.ts](../../src/app/app.module.ts). Model: [song.model.ts](../../src/app/shared/models/song.model.ts), [tag.model.ts](../../src/app/shared/models/tag.model.ts), [playlist-progress.model.ts](../../src/app/models/playlist-progress.model.ts).

## Song data

Model `Song` chứa:

- Identity/lifecycle: `id`, `createdAt`, `deleted`.
- YouTube metadata: `videoId`, `title`, `youtubeLink`, `channel`, `description`, `localized`, `largestThumbnail`, `durationSeconds`, `viewCount`.
- Tags/search: `tags`, `approvedTags`, `generatedTags`, `searchableText`.

Các trường optional có thể thiếu ở record cũ. Reader Firebase lọc `deleted` và sắp theo `createdAt` mới nhất trước.

## Nơi lưu dữ liệu theo luồng hiện tại

| Dữ liệu | Nơi đọc/ghi đã xác minh |
| --- | --- |
| Danh sách từ server | Firebase Realtime Database `/songs`, chỉ khi cache chưa có và người dùng đồng ý nạp |
| Cache danh sách | `localStorage.cachedSongs` |
| Add/delete tại route `/` | Chỉ cập nhật cache local |
| Shuffle/loop/playlist size | `localStorage.shuffleEnabled`, `loopEnabled`, `maxPlaylistSize` |
| Playback progress | `localStorage.playlistPlaybackProgress`, theo video ID |
| Master tags | Có khai báo `/master_tags` nhưng luồng tải/subscription trong `YoutubeTagService` đang comment; sync đang hoạt động chưa được xác minh |

Khẳng định cũ trong `AI_SETUP_GUIDE.md` rằng màn hình đọc và ghi Firebase không phản ánh các luồng add/delete đang có ở `MySongs2Component`. Ý định dữ liệu chuẩn và đồng bộ remote vẫn cần xác nhận tại [Q-003](../management/QUESTIONS.md).

## Tích hợp và cấu hình

- Firebase được khởi tạo từ `environment.firebase`; database access còn phụ thuộc cấu hình/rules Firebase.
- YouTube Data API v3 cần `environment.youtube.apiKey`; API quota và khả năng truy cập video phụ thuộc YouTube.
- Playback cần tải YouTube IFrame API từ YouTube.
- `environment.example.ts` chứa placeholder, không phải credentials dùng được. Không đưa API keys thật vào tài liệu hoặc Git.

Nguồn: [environment.example.ts](../../src/environments/environment.example.ts), [youtube.service.ts](../../src/app/services/youtube.service.ts), [app.module.ts](../../src/app/app.module.ts).