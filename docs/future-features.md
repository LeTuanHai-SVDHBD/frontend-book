# Ghi chú tính năng để triển khai sau khi duyệt giao diện

Chỉ thiết kế trong `frontend-book`; chưa thêm endpoint, schema hoặc xử lý thật vào dự án chính.

## SEARCH-01 — Tìm kiếm

**Vị trí thiết kế:** thanh điều hướng luôn có ô tìm kiếm; trang chủ có ô lớn; trang danh mục có khu vực kết quả/bộ lọc.

**Dự kiến:** tìm theo tên sách, tác giả, ISBN và thể loại; chuẩn hóa từ khóa tiếng Việt có/không dấu; kết hợp trạng thái phiên, sắp xếp và phân trang. Chỉ trả các bài được phép xem. Không để giá kết thúc sớm, AI nội bộ, email hoặc dữ liệu kiểm duyệt xuất hiện qua kết quả.

**Trạng thái hiện tại:** ô trên navbar/trang chủ chỉ mở ghi chú khi bấm tìm. Catalog lọc fixture để duyệt bố cục, không gọi Backend. Endpoint tìm kiếm, giới hạn và cách truy vấn sẽ thiết kế ở giai đoạn tích hợp, không coi API danh mục hiện có đã hỗ trợ đầy đủ tìm kiếm này.

**Cần bổ sung khi triển khai:** trạng thái đang tải, kết quả rỗng, lỗi, gõ từ khóa dài, phân trang và giữ bộ lọc khi quay lại trang.

## NOTIFY-01 — Thông báo

**Vị trí thiết kế:** biểu tượng chuông có chấm đỏ, bảng thông báo mẫu gồm tiêu đề, nội dung ngắn và thời gian; nút Xem tất cả thông báo.

**Ví dụ nội dung mẫu:** phiên sắp kết thúc, bài đã được duyệt, có tin nhắn giao dịch. Đây là ví dụ UI, chưa xác định đầy đủ quy tắc gửi sự kiện.

**Dự kiến:** danh sách thông báo của đúng tài khoản, số chưa đọc, đánh dấu đã đọc và mở đúng trang có quyền xem. Thiết kế riêng trạng thái trống, tải/lỗi, thời gian và nội dung dài. Cần thống nhất kênh giao, lưu bền, bù khi kết nối lại và chống trùng khi Backend triển khai.

**Giới hạn:** không dùng room đấu giá công khai để phát thông tin riêng, giá ẩn, tin nhắn hoặc hồ sơ khiếu nại. Chưa quyết định bảng/endpoint cho thông báo; không xem dropdown mẫu là bằng chứng đã có chức năng thật.

## MEDIA-01 — Gallery sách đã kích hoạt

Một phiên giới thiệu **một bản sách vật lý**. Bìa, gáy, trang xuất bản, trang ruột và video phải thuộc cùng cuốn đó. Không ghép nhiều bản sách, không thêm số lượng mua. Bản mẫu phiên 101 có 4 ảnh cùng cuốn và một khung trình phát video chưa gắn clip.

Khi tích hợp, lấy đúng `BaiDangMedia` đã gắn với bài được công bố, thứ tự ảnh/video và quyền xem. Chỉ nguồn media thật mới được gắn URL trình phát; không dùng ảnh minh họa thiết kế để làm bằng chứng AI.
