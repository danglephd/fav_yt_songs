Hãy ghi nhận mô tả lỗi:
- Khi shuffle là false thì iframe không thể play **playlist** videos khi số video trong playlist quá nhiều (>30). Với playlist ngắn (~5 videos), việc play vẫn bình thường.
- Khi shuffle là true thì iframe có thể play video bình thường.
- Nguyên nhân nghi ngờ: chúng ta đang dùng `playlist` của YouTube iframe. Khi shuffle là false, playlist giữ nguyên thứ tự và nếu `startIndex > 0` thì iframe sẽ bắt đầu từ giữa danh sách. Với playlist lớn, các video trước `startIndex` vẫn còn nằm trong queue và có thể làm iframe bị chậm/không init ổn định. Kết quả là video không play được.
- Khi shuffle là true, `startIndex` luôn ở 0 nên iframe bắt đầu từ đầu danh sách; do đó không gặp vấn đề này và có thể play bình thường.
- Đây là bug liên quan đến cách load playlist bằng iframe với `index` không phải 0 trong playlist lớn, chứ không phải bug do shuffle logic riêng lẻ.