# BookBid — bản thiết kế Frontend sau Mốc 8

Bản xem trước tương tác để duyệt giao diện của hệ thống đấu giá sách Nhóm 15. Giữ phong cách navy, vàng và nền giấy của thiết kế cũ, đồng thời tổ chức lại các màn hình theo nghiệp vụ đang có.

**Chỉ thay đổi repository `frontend-book`.** Dự án chính `my-project_book-auction-system`, nhánh `feat/Hai`, được đọc để đối chiếu tại commit [`b8f27a5`](https://github.com/LeTuanHai-SVDHBD/my-project_book-auction-system/commit/b8f27a5149f2958d01d34540558768731087bd9a). Chờ duyệt thiết kế trước khi tích hợp vào dự án chính.

## Xem nhanh giao diện

Ảnh chụp từ bản build của chính repository này:

![Trang chủ BookBid trên desktop](docs/previews/home-desktop.jpg)

[Chi tiết phiên đấu giá](docs/previews/auction-desktop.jpg) · [Kiểm duyệt và hai điểm AI](docs/previews/moderation-desktop.jpg) · [Trang chủ trên mobile](docs/previews/home-mobile.jpg)

## Chạy để xem thiết kế

Dùng Node.js 22.18 trở lên hoặc Node.js 24. Repository dùng pnpm; không cần API, worker, SQL Server, Redis hoặc API key.

PowerShell, ở thư mục repository này:

```powershell
git switch main
git pull --ff-only origin main
npx.cmd pnpm@10.34.3 install --frozen-lockfile
npx.cmd pnpm@10.34.3 dev
```

Mở **http://localhost:8443**. Trên macOS/Linux, thay `npx.cmd` bằng `npx`. Nếu chưa có mã nguồn, clone `https://github.com/LeTuanHai-SVDHBD/frontend-book.git` trước.

Cổng mặc định vẫn là 8443 của cấu hình Figma Make, khác cổng 5173 của dự án chính. Nếu 8443 đang được dùng, chọn cổng khác cho terminal hiện tại:

```powershell
$env:PORT = "8444"
npx.cmd pnpm@10.34.3 dev
```

## Cách duyệt giao diện

Thanh trên cùng ghi rõ đây là bản xem trước. Chọn **Xem với** để đổi giữa khách, người mua, chủ sách và hai Admin mẫu. Người mua/chủ sách là hai tài khoản thường dùng để kiểm tra quyền; đây không phải hai vai trò Backend riêng.

Nút **Trạng thái mẫu** cho phép mô phỏng mất/kết nối lại, yêu cầu giá được chấp nhận/bị từ chối/đang chờ, trạng thái phiên và phiên đăng nhập bị thu hồi. **Khôi phục dữ liệu mẫu** đưa toàn bộ bản xem trước về ban đầu. Thay đổi trạng thái phiên ở đây thay thế cả dữ liệu mẫu liên quan để kết quả và giao dịch không mâu thuẫn.

- **Khách:** trang chủ, tìm và lọc sách, chi tiết phiên, lịch sử giá, bình luận và uy tín công khai.
- **Người mua:** đặt giá, theo dõi phản hồi, giao dịch, chat, hai xác nhận độc lập, đánh giá sau hoàn tất và khiếu nại.
- **Chủ sách:** đăng sách theo 4 bước, quản lý bài, bổ sung bài bị từ chối, xem AI riêng, kích hoạt bài đã duyệt và đăng lại khi đủ điều kiện.
- **Admin:** kiểm duyệt cùng căn cứ và hai điểm AI độc lập; tiếp nhận, đối chiếu và phản hồi khiếu nại theo phân công.

Danh sách các trường hợp mẫu và checklist duyệt nằm ở [docs/design-review.md](docs/design-review.md). Đối chiếu endpoint và giới hạn tích hợp ở [docs/api-map.md](docs/api-map.md).

## Phạm vi bản xem trước

Dữ liệu nằm trong bộ nhớ của một trang. F5 sẽ khôi phục dữ liệu mẫu; các tab không đồng bộ với nhau. Đăng nhập/đăng ký, upload, mất kết nối, xử lý giá và phân tích AI đều là mô phỏng để duyệt UI. Đổi vai trò không phải xác thực hoặc phân quyền an toàn. Không nhập mật khẩu thật.

Tệp người dùng chọn chỉ được xem trước bằng object URL trên máy, không tải lên Cloudinary. Hai điểm AI và bằng chứng minh họa không phải kết quả thẩm định sách. Bìa SVG được tạo cho bản thiết kế, không đại diện ảnh thật hoặc xác nhận ấn bản. Không gọi Gemini, HTTP API, Socket.IO, SQL hoặc Redis và không lưu dữ liệu nghiệp vụ bên ngoài.

Khi tích hợp sau khi duyệt, Backend tiếp tục quyết định quyền, thời gian, kết quả đã COMMIT và điểm AI. `src/contracts/api.ts` chỉ ghi hợp đồng, chưa chứa HTTP client. Các giới hạn này được thể hiện ngay trên giao diện xem trước.

## Kiểm tra mã nguồn

```powershell
npx.cmd pnpm@10.34.3 typecheck
npx.cmd pnpm@10.34.3 test
npx.cmd pnpm@10.34.3 build
```

11 bài kiểm tra xác minh quy tắc của adapter mẫu: số tiền 18 chữ số, quyền đặt giá, thời gian chờ, receipt không tạo trùng, xử lý offline, hai xác nhận, quyền đánh giá, quyền xử lý khiếu nại, đăng lại, kiểm duyệt, tính nhất quán kịch bản và dữ liệu chưa biết. Chúng không thay thế smoke test SQL/Redis của dự án chính.

Đã duyệt bằng Chromium ở desktop 1440px và mobile 390px: tìm kiếm/lọc/phân trang, đặt giá đủ trạng thái, tạo bài có media và chọn thể loại, duyệt/kích hoạt, AI có NULL, chat hiển thị HTML dưới dạng chữ, giao dịch/đánh giá, khiếu nại và giới hạn quyền Admin. Các trang còn lại được kiểm tra ảnh và tràn ngang. Không phát sinh lỗi console/page hoặc request `/api` trong hành trình kiểm tra. Danh sách chi tiết ở tài liệu duyệt thiết kế.

Bản build production cũng được mở lại để kiểm tra asset nội bộ và chụp ảnh. Trang chủ và kiểm duyệt được kiểm tra thêm ở 320px và 768px, không tràn ngang.

## Cấu trúc để phát triển tiếp

| Thư mục          | Trách nhiệm                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `src/App.tsx`    | Ghép route và page; không chứa toàn bộ nghiệp vụ màn hình                  |
| `src/components` | Layout, thẻ sách, dialog, trường tiền/thể loại/media, chat, bảng phân tích |
| `src/pages`      | Trang công khai, không gian chủ sách, giao dịch, khiếu nại và Admin        |
| `src/domain`     | Kiểu dữ liệu UI, quy tắc thuần và kiểm tra adapter mẫu                     |
| `src/demo`       | Fixture, state provider, chuyển trạng thái trong bộ nhớ và object URL      |
| `src/contracts`  | Hợp đồng HTTP tham chiếu từ `feat/Hai`, tách khỏi view model               |
| `src/lib`        | Hash router, tiền dùng BigInt, định dạng và đồng hồ giao diện              |
| `src/index.css`  | Token màu/chữ/khoảng cách và các layout responsive                         |
| `public/covers`  | Bìa minh họa nội bộ, không phụ thuộc ảnh hoặc font từ bên ngoài            |

React 19, TypeScript strict và Tailwind CSS 4 được giữ lại. Cấu hình và script Figma Make vẫn được giữ. Không thêm dependency runtime. Prettier được ghim ở devDependency để định dạng TypeScript/TSX/CSS; chạy `pnpm format` sau khi sửa và kiểm tra lại `pnpm typecheck`.
