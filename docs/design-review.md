# Hướng dẫn duyệt thiết kế

## Hướng giao diện

Navy cho điều hướng và thao tác chính, vàng cho điểm nhấn, nền sáng gợi chất giấy. Tiêu đề serif giúp nhận diện không gian sách sưu tầm; nội dung và biểu mẫu dùng font hệ thống dễ đọc tiếng Việt. Desktop dùng vùng nội dung có giới hạn chiều rộng; mobile có điều hướng riêng, biểu mẫu một cột và bảng cuộn trong vùng của nó.

Các thành phần dùng chung gồm Button/LinkButton, Badge, Panel, Notice, EmptyState, Dialog, BookCard, MoneyField, GenreField, MediaPicker, ChatPanel và AnalysisPanel. Nút thao tác có đích hoặc chuyển trạng thái mẫu cụ thể; những chức năng chưa có ở Backend không được dựng thành nút hoạt động giả.

## Trường hợp mẫu có sẵn

Mở đường dẫn sau phần host, ví dụ `http://localhost:8443/#/auction/101`. Chọn vai trò tương ứng ở thanh xem trước trước khi vào trang riêng.

| Trang                         | Vai trò phù hợp    | Nội dung để duyệt                                                |
| ----------------------------- | ------------------ | ---------------------------------------------------------------- |
| `#/home`, `#/catalog`         | Khách              | Bố cục, tìm không dấu, lọc, sắp xếp, phân trang, trạng thái rỗng |
| `#/auction/101`               | Người mua          | Phiên đang chạy, gửi giá, chờ/chấp nhận/từ chối, cooldown        |
| `#/auction/103`               | Bất kỳ             | Phiên chưa bắt đầu, không có thao tác đặt giá                    |
| `#/auction/105`               | Người mua/chủ sách | Kết quả có người thắng và liên kết giao dịch đúng hai bên        |
| `#/auction/106`               | Chủ sách           | Kết quả không người thắng, đủ điều kiện đăng lại                 |
| `#/create`                    | Chủ sách           | 4 bước đăng sách, media, thể loại có tìm kiếm, ba ô tiền         |
| `#/mine`, `#/listing/107`     | Chủ sách           | Theo dõi kiểm duyệt; tab AI có độ hiếm 75, vật lý NULL           |
| `#/listing/108`, `#/edit/108` | Chủ sách           | Lý do từ chối, bổ sung và gửi lại, giữ thông tin sách gốc        |
| `#/listing/109`               | Chủ sách           | Bài đã duyệt, chủ sách chọn lịch tương lai và kích hoạt          |
| `#/trade/301`                 | Người mua/chủ sách | Chat văn bản, xác nhận từng bên, đánh giá một lần phía mua       |
| `#/complaint/501`             | Người mua/Admin    | Hồ sơ mẫu; phía chủ sách không được mở hồ sơ người mua           |
| `#/moderation`                | Admin              | Bằng chứng, media, thông số riêng, AI và quyết định có căn cứ    |
| `#/admin-complaints`          | Admin              | Tiếp nhận hồ sơ, chat chỉ đọc đúng phân công, lưu phản hồi       |
| `#/system`                    | Admin              | Trạng thái và probe minh họa; không phải kiểm tra hạ tầng thật   |
| `#/account`                   | Bất kỳ             | Profile chỉ đọc hoặc form đăng nhập/đăng ký mẫu                  |

Tiền, niên đại, danh tính và điểm trong fixture đều là dữ liệu minh họa. Đồng hồ mẫu được tạo lại theo thời điểm mở trang để có thể duyệt các trạng thái mà không cần sửa ngày thủ công.

## Hành trình nên thử

1. **Đặt giá:** chọn người mua, mở phiên 101 và gửi mức gợi ý. Giá/lịch sử giữ nguyên khi đang chờ; sau chấp nhận mới đổi. Trong thời gian chờ đặt lại, không hiện ô hoặc nút nhập giá tiếp. Dùng Trạng thái mẫu để thử từ chối, chờ lâu và mất/kết nối lại.
2. **Đăng sách:** chọn chủ sách, hoàn thành 4 bước. Tìm thể loại bằng từ khóa rồi chọn; tiền gõ bằng chữ số, dòng dưới xem giá đã nhóm nghìn. Bài mới chưa công khai và chưa có lịch. Đổi sang Admin để duyệt kèm lý do và xác nhận bằng chứng; đổi lại chủ sách để kích hoạt.
3. **AI:** mở bài 107 bằng chủ sách hoặc Admin. Hai điểm độc lập; tình trạng vật lý chưa đủ dữ liệu hiện dấu gạch và lý do, không biến thành 0. Xem tiêu chí, trọng số, bằng chứng, cảnh báo và lịch sử. Người mua ở trang công khai không xem phần này.
4. **Giao dịch:** người mua xác nhận giao dịch 301, đổi sang chủ sách xác nhận phần còn lại. Sau đó đổi lại người mua để đánh giá. Phía người bán không có khối Đánh giá người bán. Nhận xét xuất hiện trong uy tín công khai của người bán.
5. **Khiếu nại:** gửi lý do, nội dung và tối đa 5 ảnh từ giao dịch. Admin chưa tiếp nhận không xem chat; tiếp nhận xong mới đọc được và không được gửi tin hoặc đánh dấu đọc. Đổi sang Admin khác để đối chiếu quyền. Xử lý xong thì quyền đọc chat qua hồ sơ kết thúc, kết quả và xác nhận giao dịch vẫn giữ nguyên.
6. **Phiên bị thu hồi:** chọn tình huống ở Trạng thái mẫu; tài khoản mẫu về màn hình đăng nhập. Đây chỉ là cách duyệt UI đăng xuất, chưa mô phỏng đăng nhập thật giữa nhiều tab/thiết bị.

## Checklist chốt

- [ ] Bố cục, màu sắc, chữ và mức độ nổi bật của thao tác chính phù hợp nhận diện mong muốn.
- [ ] Trang chủ/danh mục/chi tiết dùng chung cách trình bày sách, giá và trạng thái.
- [ ] Mobile dễ dùng: menu mở được, biểu mẫu không tràn, giá và nút thao tác không bị cắt.
- [ ] Phân biệt rõ bài chờ duyệt, đã duyệt, đã kích hoạt, chưa bắt đầu, đang chốt và kết thúc.
- [ ] Người mua không thấy giá kết thúc sớm hoặc kết quả phân tích AI riêng.
- [ ] Chủ sách/Admin/khách không có thao tác đặt giá.
- [ ] Đang chờ xử lý không bị hiểu thành đã đặt giá thành công.
- [ ] Luồng đăng sách, AI/kiểm duyệt, giao dịch và khiếu nại đủ thông tin để người dùng quyết định.
- [ ] Thống nhất thiết kế trước khi thay Frontend của dự án chính.

## Kiểm chứng bản mẫu

TypeScript strict, 11 bài kiểm tra adapter và bản build production đã được kiểm tra. Chromium kiểm tra hành trình đầy đủ ở desktop 1440 × 1000 và mobile 390 × 844: tìm kiếm không dấu/trạng thái rỗng/phân trang, menu mobile, đặt giá đủ trạng thái và retry cùng receipt, mất/kết nối lại, chặn quyền, tạo bài có ảnh, thể loại và tiền, duyệt/kích hoạt, AI NULL, chat văn bản, hai xác nhận, đánh giá, khiếu nại có ảnh và quyền đọc chat theo phân công. Ma trận responsive còn gồm quản lý bài, bổ sung, đăng lại, kiểm duyệt, hệ thống và tài khoản.

Đây là kiểm chứng giao diện và adapter trong bộ nhớ; chưa kiểm tra tích hợp thật SQL/Redis/Socket/Gemini, đồng bộ nhiều trình duyệt, chất lượng phân tích ảnh hoặc Safari/Firefox. Các smoke test Mốc 4–8 của dự án chính vẫn cần chạy lại sau khi tích hợp.
