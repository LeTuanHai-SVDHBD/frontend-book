# Nguồn thiết kế, font và ảnh minh họa

## Bản thiết kế gốc

Figma Make: https://www.figma.com/make/VFWQgU4Q0Xafl4ssoIfz1Q/BookBid-Web-App-UI-Design

Nguồn khôi phục giao diện: `src/App.tsx` và `src/index.css` tại commit gốc [`c4c15dd`](https://github.com/LeTuanHai-SVDHBD/frontend-book/tree/c4c15dd39b700c9509b34cbeb5c99180f1db5408). Giữ màu, font, cỡ chữ, logo B, card bo tròn, ảnh thư viện, navbar và sidebar Admin; thay nội dung không phù hợp nghiệp vụ hiện tại.

Plugin Figma đọc được danh sách resource của file Make. Tuy nhiên resource không đọc được qua cầu nối hiện tại; `create_session` và `get_screenshot` trả không hỗ trợ Make. Không có ảnh Figma trực tiếp được dùng làm nền hoặc asset trong implementation; chưa tuyên bố khớp pixel với bản Figma trực tiếp.

## Ảnh thư viện

`public/assets/figma/library.jpg`: ảnh tham chiếu được dùng trong mã giao diện gốc, từ `https://images.unsplash.com/photo-1600181982553-ce7d36051c01`. Được lưu nội bộ để bản xem trước không phụ thuộc mạng khi mở trang.

## Font

Inter 500/600/700/800 và Playfair Display 700/800, đúng các font/weight được yêu cầu trong CSS gốc. Font lấy từ Google Fonts, chuyển đóng gói WOFF2 giữ nguyên glyph để giảm dung lượng và được tự phục vụ trong repo.

Đường dẫn: `public/assets/fonts/figma-font-0.woff2` đến `figma-font-5.woff2`; khai báo ở `src/styles/fonts.css`. Giấy phép OFL của từng họ font đi kèm tại `public/assets/fonts/inter-OFL.txt` và `playfairdisplay-OFL.txt`.

## Bộ ảnh của một cuốn sách mẫu

Đường dẫn dùng trong dự án: **`public/assets/book-gallery-sample.png`**.

Tạo bằng **imagegen, chế độ built-in**, để minh họa cùng một cuốn sách qua bốn góc chụp. Đây là đạo cụ/ảnh thiết kế, không chứng minh ấn bản thật, chất lượng thực tế hoặc kết quả kiểm duyệt. `BookMedia.tsx` hiển thị các góc của contact sheet bằng CSS; không ghép nhiều cuốn sách khác nhau. Poster video dùng cùng cuốn; video chưa có clip thật.

Prompt cuối cùng:

> Use case: product-mockup. Create ONE square 2-by-2 contact sheet of four photorealistic product photographs of the EXACT SAME single antique Vietnamese hardcover book for a fictional auction interface prototype. Four equal square quadrants edge-to-edge with no gutters, no panel labels, no graphics overlay, no watermarks. Same deep navy blue linen hardcover, thin decorative golden double border, cream paper edges, lightly worn corners, golden cover title VANG BÓNG MỘT THỜI and author NGUYỄN TUÂN. Do not imitate or claim an authentic historical first edition; this is a designed sample prop. Warm neutral beige tabletop, soft natural window light, elegant antique book photography. Top LEFT: the single closed book viewed from front at a slight overhead three-quarter angle, full front cover visible with comfortable margins. Top RIGHT: that exact same closed book rotated so its single spine and cream page edges are visible, no other books. Bottom LEFT: that exact same book open on its inside title page, no year or publisher authenticity claims, title typography, soft cream pages. Bottom RIGHT: that exact same book open to a spread of text pages showing subtle ageing and paper details. In every quadrant only ONE physical book, visually consistent materials and dimensions. High detail paper and cloth texture, photographic not illustration, coherent editorial color grade. Strictly 2-by-2 equal grid to be displayed as four CSS-clipped gallery views. Do not create a website screenshot.
