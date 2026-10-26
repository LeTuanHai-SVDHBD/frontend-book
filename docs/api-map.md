# Đối chiếu UI với hệ thống đến Mốc 8

Nguồn tham chiếu: nhánh [`feat/Hai` tại b8f27a5](https://github.com/LeTuanHai-SVDHBD/my-project_book-auction-system/tree/b8f27a5149f2958d01d34540558768731087bd9a), gồm `docs/flows.md`, `docs/realtime.md`, `docs/ai-analysis.md`, `docs/after-sales.md` và controller/service/validation tương ứng. Repository hiện tại chỉ dùng dữ liệu tĩnh và nút mở ghi chú, không mô phỏng xử lý nghiệp vụ; bảng dưới là bản đồ cho giai đoạn tích hợp sau khi thiết kế được duyệt.

## Màn hình và endpoint

| Màn hình/thao tác  | Hợp đồng thật cần dùng khi tích hợp                                                                                                                | Quy tắc giao diện đã thể hiện                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tài khoản          | `GET /api/auth/csrf`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`                               | Người dùng thường và Admin; không có Google login, quên mật khẩu hoặc sửa profile chưa có API               |
| Phiên điều khiển   | `POST /api/auth/control`, `GET /api/auth/control-status` và cơ chế thu hồi hiện có                                                                 | Đăng nhập bằng mật khẩu mới thay owner; tab bị thu hồi về đăng nhập, F5 không lấy lại owner                 |
| Khám phá           | `GET /api/posts/catalog`, `GET /api/posts/catalog/:postId`                                                                                         | Chỉ bài công bố; không lấy giá ẩn, điểm AI hoặc dữ liệu kiểm duyệt riêng                                    |
| Bài của tôi        | `GET /api/posts/mine`, `GET /api/posts/:postId`                                                                                                    | Danh sách của mình; chi tiết riêng chỉ chủ bài hoặc Admin                                                   |
| Đăng sách          | `GET /api/media/config`, `POST /api/media/image`, `POST /api/media/video`, `POST /api/posts`                                                       | Upload bằng vé; tạo sách/bài/phiên pending, chưa có lịch                                                    |
| Media chưa gắn bài | `DELETE /api/media/:upload_id`                                                                                                                     | Chỉ vé của người dùng, chưa gắn dữ liệu; không phải xóa media lịch sử                                       |
| Bổ sung/đăng lại   | `POST /api/posts/:postId/resubmit`, `POST /api/posts/:postId/relist`                                                                               | Bổ sung bài bị từ chối; đăng lại phiên cuối đã có kết quả không người thắng; giữ Sach và lịch sử            |
| Kiểm duyệt         | `GET /api/posts/pending`, `POST /api/posts/:postId/review`                                                                                         | Admin ghi lý do; phê duyệt phải xác nhận bằng chứng quý hiếm; AI không tự duyệt                             |
| Kích hoạt          | `POST /api/posts/:postId/activate`                                                                                                                 | Chỉ chủ bài đã duyệt, lịch tương lai; dùng đúng phiên đã có                                                 |
| Phân tích riêng    | `GET /api/ai/:postId?analysis=:analysisId`, `POST /api/ai/:postId`                                                                                 | GET chủ/Admin; POST phân tích lại chỉ Admin ở trạng thái phù hợp; hai điểm độc lập, có thể NULL             |
| Phiên công khai    | `GET /api/auctions/:auctionId`, `GET /api/auctions/:auctionId/history`                                                                             | Giá, lịch sử và kết quả lấy từ snapshot; hết giờ chỉ chờ chốt, không tự công bố người thắng                 |
| Đặt giá            | `GET /api/auctions/:auctionId/bid-status`, `POST /api/auctions/:auctionId/bids`, `GET /api/auctions/:auctionId/requests/:requestId`                | 202 là đang chờ; chỉ thành công khi quyết định đã lưu; ẩn thao tác của chủ/Admin/khách và trong cooldown    |
| Bình luận/uy tín   | `GET/POST /api/community/auctions/:auctionId/comments`, `GET /api/community/auctions/:auctionId/reputation`                                        | Bình luận khóa theo giờ/trạng thái; Admin chỉ đọc. Uy tín từ đánh giá của giao dịch hoàn tất                |
| Giao dịch          | `GET /api/community/trades`, `GET /api/community/trades/:tradeId`, `POST /api/community/trades/:tradeId/confirm`                                   | Chỉ hai bên; mỗi bên xác nhận phần mình; đủ hai xác nhận mới hoàn tất                                       |
| Chat               | `POST /api/community/trades/:tradeId/conversation`, `GET/POST /api/community/trades/:tradeId/messages`, `POST /api/community/trades/:tradeId/read` | Văn bản tối đa 4.000 ký tự; đúng hai thành viên; chỉ người nhận đánh dấu đọc                                |
| Đánh giá           | `POST /api/community/trades/:tradeId/review`                                                                                                       | Người mua, giao dịch hoàn tất, một lần; không có sửa/xóa hoặc đánh giá phía người bán                       |
| Gửi khiếu nại      | `POST /api/community/trades/:tradeId/complaints`, `GET /api/community/complaints`, `GET /api/community/complaints/:id`                             | Hồ sơ riêng của người gửi; lý do 300, nội dung 12.000 ký tự, 0–5 ảnh                                        |
| Xử lý khiếu nại    | `POST /api/community/complaints/:id/claim`, `POST /api/community/complaints/:id/resolve`, `GET /api/community/complaints/:id/messages`             | Admin được gán, hồ sơ đang xử lý mới đọc chat; chỉ đọc; phản hồi tối đa 8.000 ký tự; không tự đổi giao dịch |

`postId`, `auctionId`, `bookId` và `tradeId` là các định danh riêng. Adapter mẫu ghép chúng trong một view model để duyệt UI; không truyền ID trên route này vào endpoint khác khi tích hợp.

## Dữ liệu và quyền

- API lấy chủ thể từ session, không nhận `userId`/vai trò từ bộ chọn xem trước. Cookie HttpOnly, CSRF và header `X-Tab-ID` theo cơ chế của dự án chính; không thay bằng localStorage hoặc vai trò client. Chỉ đăng nhập mật khẩu mới thay phiên điều khiển.
- Tiền là chuỗi số nguyên dương, tối đa 18 chữ số. Ô nhập giữ số thuần; định dạng nhóm nghìn ở dòng xem trước. Dùng BigInt cho tính toán UI, không Number/parseFloat. Giá kết thúc sớm phải từ giá khởi điểm trở lên. Cooldown Backend là số nguyên 10–30 giây, dropdown mẫu chọn 10/15/20/25/30.
- `gia_toi_thieu` là ngưỡng **kết thúc sớm**, không phải giá dự trữ để quyết định không người thắng khi hết giờ. Projection công khai phải loại trường này; không gửi về người mua rồi chỉ ẩn bằng CSS. View model mẫu giữ thông số riêng trong map riêng nhưng tất cả fixture vẫn nằm trong bundle, không phải ranh giới bảo mật.
- `row_version` là hex 16 ký tự. Khi bổ sung/duyệt/kích hoạt gửi bản đọc mới nhất. HTTP 409 cần đọc lại và yêu cầu người dùng đối chiếu trước khi ghi tiếp; không gán version mặc định.
- Tạo bài/đăng lại/đặt giá dùng UUID v4; retry cùng yêu cầu giữ nguyên UUID và nội dung. Bình luận, chat và tạo khiếu nại hiện không có receipt UUID; không tự retry POST khi mất phản hồi, đọc lại trước để tránh trùng.
- Upload thật gửi body nhị phân qua API và dùng `{upload_id,tieu_de}` được cấp cho đúng owner. Không gửi object URL hoặc URL do người dùng tự khai vào `media`. MIME/magic bytes/kích thước vẫn phải do Backend kiểm tra.
- Năm, tác giả, ISBN và thể loại chưa biết có thể NULL theo hợp đồng; không tự điền năm hiện tại. Thể loại dùng đúng danh mục `shared/bookGenres.js`, tìm kiếm để chọn một mục, không thêm mục tự do.
- Bài bị từ chối và phiên bị từ chối có trạng thái khác nhau: `BaiDang.tu_choi` đi với `PhienDauGia.khong_dat_kiem_duyet`. `ListingStatus` trong UI là trạng thái trình bày, không phải DTO ghi trực tiếp.
- AI riêng có lịch sử, trọng số, bằng chứng, cảnh báo và trạng thái xử lý. Không đủ quan sát không đồng nghĩa không tồn tại; thiếu tiêu chí áp dụng giữ NULL. Chủ sách/Admin xem; người mua không xem điểm hoặc bằng chứng nội bộ.
- Hoàn tất giao dịch không đóng chat tự động. Hồ sơ khiếu nại của một bên không tự mở cho bên kia; Admin hết quyền đọc chat qua hồ sơ sau khi xử lý xong. Khiếu nại không tự hoàn tiền, đổi người thắng hoặc xác nhận giao dịch.

## Realtime khi tích hợp sau duyệt

Namespace `/auctions`: gửi `auction:watch` với `{auctionId}` hoặc `{catalog:true}`, sau ACK đọc lại HTTP snapshot. `auction:changed` chỉ là tín hiệu đọc lại; không chứa quyết định đặt giá riêng. Sau reconnect phải đăng ký lại room, đọc snapshot, trạng thái đặt lại và receipt của yêu cầu còn chờ. Poll bù mỗi 5 giây và khi quay lại tab theo triển khai hiện có. Chat riêng dùng HTTP polling theo dự án chính, không dùng room đấu giá công khai.

Đồng hồ thật dựa `server_time` và độ trôi `performance.now()`, cập nhật lại khi đồng bộ. Đồng hồ của bản mẫu là thời điểm cố định, chỉ để duyệt thiết kế. Không tự công bố kết quả từ bộ đếm về 0; chỉ snapshot đã có kết quả Backend mới xác định thắng/thua.

## Những chức năng không tự thêm vào thiết kế

Không dựng thanh toán trực tuyến, hoàn tiền, vận chuyển, xóa bài/lưu nháp server, kết thúc phiên thủ công, chat đính kèm tệp, sửa/xóa đánh giá, xuất báo cáo hoặc quản lý tài khoản tùy ý khi Backend hiện tại chưa có hợp đồng tương ứng. Trang hệ thống chỉ là mẫu hình thức trạng thái/probe; không coi màu xanh mẫu là SQL/Redis thật đã sẵn sàng.

Sau khi duyệt: tạo lớp HTTP adapter riêng thay cho dữ liệu tĩnh ở `src/demo`, map DTO sang view model theo từng projection/quyền, giữ cơ chế tài khoản và realtime hiện có, rồi chạy lại smoke test các Mốc 4–8 với SQL/Redis và ảnh/video thật. Không dùng sự kiện mẫu hoặc kiểm tra client thay cho validation Backend.
