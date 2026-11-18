Yêu cầu là:
- Có dữ liệu hợp lệ trong localStorage: chỉ sử dụng local, không truy cập Realtime Database.
- Không có dữ liệu local: mới kết nối Realtime Database để lấy snapshot ban đầu.
- Sau khi lấy snapshot: lưu vào localStorage, không tiếp tục realtime synchronization.

Nên triển khai theo nguyên tắc Lazy initialization:

Application starts
       |
       v
Check localStorage
       |
       +---- Cache exists ----> Use local data
       |                       No Firebase DB subscription
       |
       +---- Cache missing ---> Connect to Realtime Database
                                      |
                                      v
                                 Get snapshot
                                      |
                                      v
                                 Save to localStorage
                                      |
                                      v
                                 Unsubscribe