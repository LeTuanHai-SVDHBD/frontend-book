# Checklist duyệt thiết kế BookBid

## Phong cách được khôi phục

- Navy `#1f3a5f`, vàng `#d9a441`, nền kem `#f7f5f0`, logo chữ B trong ô vàng.
- Inter cho nội dung; Playfair Display đậm cho tiêu đề. Chữ nền desktop 20px, mobile 18px; tiêu đề chính desktop 44–56px, hero tới 70px; trường nhập/nút 56–64px.
- Người dùng có navbar tìm kiếm, chuông và avatar; trang chủ có ảnh thư viện và ô tìm lớn; card bo tròn/đổ bóng, footer navy. Admin chỉ có sidebar navy, chuông ở trên menu và tài khoản ở cuối sidebar; không có header ngang hoặc lời mời đăng sách.
- Nghiệp vụ được thể hiện qua **dữ liệu mẫu và trạng thái chọn sẵn**, không có tiến trình đặt giá/worker/SQL giả chạy phía client.

## Các mục đã chốt giữ và điều chỉnh

- `tu_choi` hiển thị **Bị từ chối**; nút **Bổ sung và gửi duyệt lại** dẫn tới luồng đã có, không tạo trạng thái “Cần bổ sung” riêng.
- Giữ hai xác nhận giao dịch độc lập, đánh giá phía người mua sau hoàn tất.
- Giữ Admin tiếp nhận khiếu nại và quyền xem chat chỉ đọc theo người xử lý; giữ Admin Phương/Huy để đối chiếu quyền.
- Ẩn lời mời đăng sách ở danh mục khi xem bằng Admin. Footer Admin dẫn tới kiểm duyệt/khiếu nại/tài khoản, không dẫn tới quản lý bài cá nhân.
- Sidebar Admin có chuông thông báo mẫu theo ngữ cảnh quản trị và avatar/tên mở trang tài khoản. Không render header ngang cho Admin.
- Từ 1100px trở xuống, sidebar mở qua nút **Menu quản trị**. Ngăn kéo dùng dialog để giữ focus, hỗ trợ Escape, nút đóng, chạm nền ngoài và tự đóng khi quay lại desktop. Bảng thông báo có thể mở/đóng ngay từ ngăn kéo.
- Thanh **Chọn màn hình để xem / Vai trò / Trạng thái mẫu** vẫn là công cụ duyệt bản thiết kế, không thuộc header sản phẩm khi tích hợp.

Ảnh: [Admin desktop](previews/moderation-desktop.jpg), [thông báo Admin](previews/admin-notifications-desktop.jpg), [menu mobile](previews/admin-menu-mobile.jpg), [danh mục Admin desktop](previews/admin-catalog-desktop.jpg), [danh mục Admin mobile](previews/admin-catalog-mobile.jpg).

## Đường dẫn mẫu

Mở sau `http://localhost:8443/`, hoặc dùng bộ chọn **Chọn màn hình để xem**. Bộ chọn này tự chuyển vai trò mẫu phù hợp.

| Trang                 | Vai trò            | Nội dung                                                           |
| --------------------- | ------------------ | ------------------------------------------------------------------ |
| `#/home`, `#/catalog` | Người mua/khách    | Hero, ảnh, tìm kiếm, danh mục/bộ lọc và card sách                  |
| `#/auction/101`       | Người mua          | 4 ảnh cùng cuốn, khung video, giá và trạng thái đặt giá mẫu        |
| `#/auction/103`       | Bất kỳ             | Chưa bắt đầu, không có ô đặt giá                                   |
| `#/auction/105`       | Người mua/chủ sách | Kết quả có người thắng, liên kết giao dịch                         |
| `#/auction/106`       | Chủ sách           | Không có người thắng, thiết kế đăng lại                            |
| `#/create`            | Chủ sách           | Form 4 bước được điền dữ liệu mẫu và media mẫu                     |
| `#/mine`              | Chủ sách           | Bài chờ duyệt/đã duyệt/đã kích hoạt/bị từ chối/kết thúc            |
| `#/listing/107`       | Chủ/Admin          | Tab AI riêng, độ hiếm 75 và vật lý NULL                            |
| `#/edit/108`          | Chủ sách           | Bổ sung bài bị từ chối                                             |
| `#/listing/109`       | Chủ sách           | Thiết kế đặt lịch/kích hoạt bài đã duyệt                           |
| `#/trade/301`         | Người mua/chủ sách | Chat và hai xác nhận; dùng Trạng thái mẫu để xem hoàn tất/đánh giá |
| `#/complaint/501`     | Người gửi/Admin    | Hồ sơ, phân công và chat chỉ đọc ở trạng thái được phép            |
| `#/moderation`        | Admin              | Sidebar, hàng đợi, bằng chứng, AI và form quyết định               |
| `#/admin-complaints`  | Admin              | Danh sách khiếu nại mẫu                                            |
| `#/account`           | Khách/người dùng   | Form đăng nhập/đăng ký hoặc profile mẫu                            |

## Kiểm tra để chốt

- [ ] Màu, font, độ lớn chữ, hero và bố cục card đúng phong cách mong muốn.
- [ ] Ảnh/video của cùng một bản sách; không có bộ chọn số lượng; bấm thumbnail đổi đúng góc ảnh.
- [ ] Khung video có poster/nút play/thời lượng/thanh điều khiển mẫu, ghi rõ chưa có clip thật.
- [ ] Navbar người dùng và trang chủ có ô tìm kiếm; chuông mở bảng thông báo mẫu. Admin dùng chuông và tài khoản trong sidebar, không có header ngang.
- [ ] Menu mobile người dùng và ngăn kéo Admin dễ mở; đóng bằng Escape/điều hướng; nội dung đọc rõ, không tràn ngang ở 320/390/768/1100px.
- [ ] Chủ/Admin/khách không có ô đặt giá; chọn cooldown thì ẩn ô/nút nhập tiếp.
- [ ] Hai điểm AI riêng, NULL được giải thích; không đưa AI/giá ẩn ra trang người mua.
- [ ] Đánh giá chỉ hiện phía người mua; chọn mẫu hoàn tất mới có form đánh giá.
- [ ] Chỉ Admin Phương được đọc chat khi chọn hồ sơ đang được giao xử lý; Admin Huy không có chat đó.
- [ ] Nhãn **Bị từ chối** và nút **Bổ sung và gửi duyệt lại** đúng nghĩa; Admin không thấy lời mời đăng sách.
- [ ] Các nút nghiệp vụ chỉ mở ghi chú, không đổi dữ liệu mẫu.

## Kiểm chứng và giới hạn

Kiểm tra TypeScript/build, Chromium desktop 1440px, mobile 390px; trang chủ/chi tiết thêm 320px và 768px. Kiểm tra font được tải thật, ảnh nội bộ, gallery, khung video, bảng thông báo, hành động không ghi dữ liệu, điều kiện hiển thị và tràn ngang. Các trang quản lý, đăng/bổ sung/đăng lại, AI, giao dịch, khiếu nại, Admin và tài khoản đều có trong ma trận duyệt responsive.

File Figma Make gốc được truy vấn bằng plugin; công cụ trả danh sách source/resource. Ở phiên triển khai này resource không đọc được qua cầu nối và công cụ screenshot không hỗ trợ Make. Vì vậy giao diện được khôi phục từ mã gốc trong repo, không tuyên bố đã đối chiếu pixel với ảnh Figma trực tiếp. Nguồn và thông số ở [design-sources.md](design-sources.md).

Chưa kiểm tra SQL/Redis/Socket/Gemini hay trình duyệt khác. Các test xử lý nghiệp vụ ở bản mẫu trước đã bỏ vì bản này chỉ thiết kế; nghiệm thu tích hợp thuộc giai đoạn dự án chính sau khi duyệt.

Kiểm tra bổ sung cho bố cục Admin đã chốt: Chromium trên production build ở 1440px và 1100/768/390/320px; chuông/tài khoản trong sidebar, mở thông báo từ ngăn kéo, Escape/focus, đóng khi đổi trang hoặc quay lại desktop; header/CTA người dùng giữ nguyên. Đối chiếu lại hai xác nhận, đánh giá riêng phía người mua, bổ sung bài bị từ chối và quyền chat giữa hai Admin. Không gọi API thật.
