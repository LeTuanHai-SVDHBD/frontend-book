import { useState, type ReactNode } from "react";

const libraryPhoto =
  "https://images.unsplash.com/photo-1600181982553-ce7d36051c01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600";
const bookPhotos = [
  "https://images.unsplash.com/photo-1491841651911-c44c30c34548?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=700&h=900",
  "https://images.unsplash.com/photo-1595123550441-d377e017de6a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=700&h=900",
  "https://images.unsplash.com/photo-1573592371950-348a8f1d9f38?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=700&h=900",
  "https://images.unsplash.com/photo-1722977735215-d28f2ac6efba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=700&h=900",
];

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "gold" | "outline" | "danger" | "success" | "ghost";
  onClick?: () => void;
  className?: string;
};

function Button({ children, variant = "primary", onClick, className = "" }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Icon({ name }: { name: "search" | "bell" | "upload" | "play" | "chat" | "image" }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    upload: <><path d="M12 3v13M7 8l5-5 5 5" /><path d="M4 15v6h16v-6" /></>,
    play: <><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4Z" /></>,
    chat: <><path d="M4 4h16v12H8l-4 4Z" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-4L5 20" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{paths[name]}</svg>;
}

function Badge({ children, tone = "navy" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select defaultValue={value}>
        <option>{value}</option>
        <option>Chọn nội dung khác</option>
      </select>
    </label>
  );
}

function PageTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="page-heading">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {desc && <p>{desc}</p>}
    </div>
  );
}

function Navbar({ go }: { go: (n: number) => void }) {
  return (
    <header className="navbar">
      <button className="logo" onClick={() => go(1)}><span>B</span>BookBid</button>
      <div className="nav-search"><Icon name="search" /><input placeholder="Tìm sách, tác giả, ISBN..." /></div>
      <nav>
        <button onClick={() => go(1)}>Trang chủ</button>
        <button onClick={() => go(6)}>Đấu giá</button>
        <button onClick={() => go(3)}>Đăng sách</button>
        <button onClick={() => go(5)}>Bài đăng của tôi</button>
      </nav>
      <button className="icon-button" aria-label="Thông báo"><Icon name="bell" /><i /></button>
      <button className="avatar" aria-label="Tài khoản">LA</button>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="logo logo-light"><span>B</span>BookBid</div>
      <p>Nền tảng đấu giá sách minh bạch, an tâm cùng phân tích AI.</p>
      <div><b>Hỗ trợ</b><span>Trung tâm trợ giúp</span><span>Điều khoản sử dụng</span></div>
      <div><b>Liên hệ</b><span>hotro@bookbid.vn</span><span>1900 6868</span></div>
    </footer>
  );
}

function UserShell({ children, go }: { children: ReactNode; go: (n: number) => void }) {
  return <><Navbar go={go} /><main>{children}</main><Footer /></>;
}

const books = [
  { title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài • Bản in 1941", price: "12.500.000đ", score: "9,2/10" },
  { title: "Truyện Kiều", author: "Nguyễn Du • Bản Nôm", price: "8.750.000đ", score: "8,7/10" },
  { title: "Vang Bóng Một Thời", author: "Nguyễn Tuân • 1940", price: "6.200.000đ", score: "8,5/10" },
  { title: "Số Đỏ", author: "Vũ Trọng Phụng • 1938", price: "9.100.000đ", score: "8,9/10" },
];

function BookCard({ book, index, go }: { book: typeof books[number]; index: number; go: (n: number) => void }) {
  return (
    <Card className="book-card">
      <button className="book-image" onClick={() => go(2)}>
        <img src={bookPhotos[index % bookPhotos.length]} alt={`Bìa sách ${book.title}`} />
        <Badge tone="gold">Điểm hiếm AI: {book.score}</Badge>
      </button>
      <div className="book-content">
        <Badge tone="green">Đang đấu giá</Badge>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <div className="price-row"><div><span>Giá hiện tại</span><strong>{book.price}</strong></div><div className="mini-time"><span>Còn lại</span><b>02:14:38</b></div></div>
      </div>
    </Card>
  );
}

function AuthScreen() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  return (
    <div className="auth-screen">
      <section className="auth-visual" style={{ backgroundImage: `linear-gradient(135deg, rgba(18,44,75,.94), rgba(18,44,75,.5)), url(${libraryPhoto})` }}>
        <div className="logo logo-light"><span>B</span>BookBid</div>
        <div>
          <Badge tone="gold">Đấu giá thông minh cùng AI</Badge>
          <h1>Đấu giá sách quý,<br />minh bạch cùng AI</h1>
          <p>Khám phá, định giá và sở hữu những ấn bản giá trị trong một cộng đồng đáng tin cậy.</p>
        </div>
        <p>Hơn 12.000 người yêu sách đang tham gia</p>
      </section>
      <section className="auth-form">
        <div className="auth-panel">
          <div className="tabs tabs-wide">
            <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Đăng nhập</button>
            <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Đăng ký</button>
          </div>
          <h2>{tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản BookBid"}</h2>
          <p>{tab === "login" ? "Tiếp tục hành trình sưu tầm sách quý của bạn." : "Tham gia cộng đồng yêu sách uy tín hàng đầu."}</p>
          {tab === "signup" && <Field label="Họ và tên" placeholder="Nguyễn Minh Anh" />}
          <Field label="Email" placeholder="minhanh@email.com" type="email" />
          {tab === "signup" && <Field label="Số điện thoại" placeholder="0901 234 567" />}
          <Field label="Mật khẩu" placeholder="Nhập ít nhất 8 ký tự" type="password" />
          {tab === "signup" && <Field label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" type="password" />}
          <div className="check-row"><label><input type="checkbox" /> {tab === "login" ? "Ghi nhớ đăng nhập" : "Tôi đồng ý với điều khoản sử dụng"}</label>{tab === "login" && <button>Quên mật khẩu?</button>}</div>
          <Button variant="gold">{tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</Button>
          <div className="divider"><span>hoặc tiếp tục với</span></div>
          <Button variant="outline">Tài khoản Google</Button>
        </div>
      </section>
    </div>
  );
}

function HomeScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="hero">
        <div className="hero-copy">
          <Badge tone="gold">Nền tảng sách quý số 1 Việt Nam</Badge>
          <h1>Mỗi cuốn sách quý,<br /><em>một câu chuyện vô giá.</em></h1>
          <p>Khám phá kho sách hiếm được AI thẩm định. Đấu giá công khai, an toàn và minh bạch.</p>
          <div className="hero-search"><Icon name="search" /><input placeholder="Bạn đang tìm cuốn sách nào?" /><Button variant="gold">Tìm kiếm</Button></div>
          <div className="trust-row"><b>12.000+<span>Thành viên</span></b><b>4.800+<span>Sách đã đấu giá</span></b><b>98%<span>Giao dịch an toàn</span></b></div>
        </div>
        <div className="hero-image"><img src={libraryPhoto} alt="Thư viện sách cổ ấm áp" /><Card><b>AI đã thẩm định</b><span>Độ chính xác 96%</span></Card></div>
      </section>
      <section className="section">
        <h2>Khám phá theo thể loại</h2>
        <div className="chips">{["Văn học", "Sách cổ", "Sách hiếm", "Truyện tranh", "Giáo trình"].map((x, i) => <button className={i === 1 ? "active" : ""} key={x}>{x}</button>)}</div>
      </section>
      <section className="section">
        <div className="section-head"><div><span className="eyebrow">Phiên đấu giá trực tiếp</span><h2>Đang đấu giá</h2></div><Button variant="outline" onClick={() => go(6)}>Xem tất cả</Button></div>
        <div className="book-grid">{books.map((b, i) => <BookCard key={b.title} book={b} index={i} go={go} />)}</div>
      </section>
      <section className="section feature-band">
        <div><span className="eyebrow">Tuyển chọn bởi chuyên gia</span><h2>Sách nổi bật</h2><p>Những ấn bản đặc biệt có giá trị lịch sử và sưu tầm cao.</p><Button variant="gold">Khám phá ngay</Button></div>
        <img src={bookPhotos[1]} alt="Tuyển tập sách cổ nổi bật" />
        <div><span className="eyebrow">Đừng bỏ lỡ</span><h2>Sắp kết thúc</h2><strong>00 : 46 : 12</strong><p>“Việt Nam Văn Hóa Sử Cương” — Đào Duy Anh</p></div>
      </section>
    </UserShell>
  );
}

function DetailScreen({ go }: { go: (n: number) => void }) {
  const [tab, setTab] = useState("Mô tả");
  return (
    <UserShell go={go}>
      <section className="section breadcrumb">Trang chủ / Sách cổ / <b>Vang Bóng Một Thời</b></section>
      <section className="section detail-grid">
        <div className="gallery">
          <div className="main-photo"><img src={bookPhotos[0]} alt="Bìa Vang Bóng Một Thời" /><button><Icon name="play" /> Xem video sách</button></div>
          <div className="thumbnails">{bookPhotos.map((p, i) => <button className={i === 0 ? "active" : ""} key={p}><img src={p} alt={`Ảnh sách góc ${i + 1}`} /></button>)}</div>
        </div>
        <div className="auction-info">
          <Badge tone="green">Đang đấu giá</Badge>
          <h1>Vang Bóng Một Thời</h1>
          <p className="lead">Nguyễn Tuân • Nhà xuất bản Tân Dân</p>
          <div className="facts"><span><b>Năm xuất bản</b>1940</span><span><b>Tình trạng</b>Tốt — 85%</span><span><b>Thể loại</b>Văn học Việt Nam</span><span><b>Mã sách</b>BB-240819</span></div>
          <div className="current-price"><span>Giá hiện tại</span><strong>6.200.000đ</strong><p>Giá khởi điểm: 3.500.000đ • 18 lượt đặt</p></div>
          <div className="countdown"><span>Phiên đấu giá kết thúc sau</span><div><b>02</b><i>Giờ</i><b>14</b><i>Phút</i><b>38</b><i>Giây</i></div></div>
          <Button variant="gold" onClick={() => go(6)}>Đặt giá ngay</Button>
          <p className="safe-note">Giao dịch được bảo vệ • AI xác thực 94%</p>
        </div>
      </section>
      <section className="section">
        <div className="tabs">{["Mô tả", "Phân tích AI", "Lịch sử đặt giá", "Người bán"].map(x => <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>{x}</button>)}</div>
        <Card className="tab-content">
          <h2>{tab}</h2>
          {tab === "Mô tả" && <p>Ấn bản đầu tiên của tác phẩm “Vang Bóng Một Thời”, in tại nhà in Tân Dân năm 1940. Sách còn đủ trang, bìa nguyên bản, gáy chắc chắn. Có dấu thời gian tự nhiên phù hợp với niên đại.</p>}
          {tab === "Phân tích AI" && <div className="ai-inline"><b>8,5/10</b><p>Độ hiếm cao. Hệ thống phát hiện vết ố nhẹ ở bìa sau nhưng không ảnh hưởng đến cấu trúc sách.</p><Button onClick={() => go(4)}>Xem báo cáo đầy đủ</Button></div>}
          {tab === "Lịch sử đặt giá" && <BidList />}
          {tab === "Người bán" && <div className="seller"><div className="avatar">NT</div><div><h3>Nguyễn Thành Nam</h3><p>★★★★★ 4,9 • 86 giao dịch thành công</p></div><Badge tone="green">Đã xác minh</Badge></div>}
        </Card>
      </section>
    </UserShell>
  );
}

function Stepper() {
  return <div className="stepper">{["Thông tin sách", "Hình ảnh / Video", "Thiết lập đấu giá", "Xác nhận"].map((x, i) => <div className={i === 0 ? "active" : ""} key={x}><b>{i + 1}</b><span>{x}</span></div>)}</div>;
}

function UploadBox({ video = false }: { video?: boolean }) {
  return <div className="upload-box"><Icon name={video ? "play" : "upload"} /><b>{video ? "Tải video giới thiệu sách" : "Kéo thả hình ảnh vào đây"}</b><span>{video ? "MP4, tối đa 100MB" : "JPG, PNG, tối đa 10MB mỗi ảnh"}</span><Button variant="outline">Chọn tệp</Button></div>;
}

function CreateListingScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="section"><PageTitle eyebrow="Bắt đầu phiên đấu giá" title="Đăng sách để đấu giá" desc="Cung cấp thông tin chính xác để AI phân tích và thu hút người mua phù hợp." /><Stepper /></section>
      <section className="section form-layout">
        <Card>
          <h2>Thông tin sách</h2>
          <div className="form-grid"><Field label="Tên sách" placeholder="Ví dụ: Vang Bóng Một Thời" /><Field label="Tác giả" placeholder="Nhập tên tác giả" /><Field label="Nhà xuất bản" placeholder="Nhập nhà xuất bản" /><Field label="Năm xuất bản" placeholder="Ví dụ: 1940" /><Field label="ISBN hoặc mã sách" placeholder="Nhập mã nếu có" /><SelectField label="Thể loại" value="Văn học Việt Nam" /><SelectField label="Tình trạng" value="Tốt — Có dấu thời gian nhẹ" /><Field label="Mô tả chi tiết" placeholder="Mô tả nguồn gốc, đặc điểm và tình trạng sách..." /></div>
        </Card>
        <Card><h2>Hình ảnh và video</h2><div className="upload-grid"><UploadBox /><UploadBox video /></div></Card>
        <Card><h2>Thiết lập đấu giá</h2><div className="form-grid"><Field label="Giá khởi điểm" placeholder="3.500.000đ" /><Field label="Bước giá" placeholder="50.000đ" /><Field label="Giá tối thiểu" placeholder="Ví dụ: 5.000.000đ" /></div><div className="auction-timing-note"><b>Thời gian đấu giá được thiết lập sau khi bài đăng được duyệt</b><p>Bạn sẽ chọn thời gian bắt đầu và thời lượng phiên tại bước kích hoạt.</p></div></Card>
        <Card className="form-actions"><div><b>Bài đăng sẽ được AI phân tích</b><p>Kết quả giúp người mua hiểu rõ hơn về độ hiếm và tình trạng sách.</p></div><Button variant="outline">Lưu nháp</Button><Button variant="gold" onClick={() => go(4)}>Gửi bài đăng</Button></Card>
      </section>
    </UserShell>
  );
}

function AnalysisScreen({ go }: { go: (n: number) => void }) {
  const conditionCriteria = [
    { label: "Bìa", status: "Cần thêm ảnh toàn cảnh" },
    { label: "Gáy và liên kết", status: "Ảnh hiện tại chưa rõ" },
    { label: "Trang ruột", status: "Cần thêm ảnh đại diện" },
    { label: "Mép giấy", status: "Chưa có ảnh đối chiếu" },
    { label: "Bìa áo", status: "Chưa xác định dữ liệu" },
  ];
  return (
    <UserShell go={go}>
      <section className="section"><PageTitle eyebrow="Báo cáo đa phương thức" title="Kết quả phân tích AI" desc="Hệ thống hiển thị các tiêu chí đã đánh giá được từ hình ảnh, video và thông tin bạn cung cấp." /></section>
      <section className="section analysis-top">
        <Card className="gauge-card"><div className="gauge gauge-pending"><div><strong>—</strong><span>Chưa đủ dữ liệu</span></div></div><h2>Điểm hỗ trợ đánh giá độ hiếm</h2><p>Chưa có đủ dữ liệu xuất bản và nguồn đối chiếu để tính điểm trên thang 100.</p></Card>
        <Card className="condition-card"><Badge tone="orange">Cần bổ sung dữ liệu</Badge><h2>Điểm tình trạng vật lý: Chưa thể tính</h2><p>Thiếu ảnh chụp rõ gáy và liên kết nên hệ thống chưa thể tính điểm tình trạng vật lý.</p><div className="metric metric-neutral"><b>Kết quả đã ghi nhận</b><span>Phát hiện vết ố ở bìa sau</span></div></Card>
        <div className="warning-stack">
          <div className="warning warning-orange"><b>Phát hiện vết ố</b><span>Ở góc phải bìa sau</span></div>
          <div className="warning warning-gold"><b>Ảnh chưa rõ gáy sách</b><span>Nên bổ sung ảnh chụp thẳng</span></div>
          <div className="warning warning-red"><b>Năm xuất bản chưa khớp</b><span>Cần đối chiếu lại trang bản quyền</span></div>
        </div>
      </section>
      <section className="section two-col">
        <Card><h2>Chi tiết tình trạng vật lý</h2><div className="score-list">{conditionCriteria.map(({ label, status }) => <div className="score-pending" key={label}><b>{label}</b><span /><strong>{status}</strong></div>)}</div></Card>
        <Card><h2>Vị trí cần lưu ý</h2><div className="annotated"><img src={bookPhotos[0]} alt="Ảnh sách được AI đánh dấu" /><i className="mark-one">Vết ố nhẹ</i><i className="mark-two">Gáy mờ</i></div></Card>
      </section>
      <section className="section action-bar"><div><b>Hãy kiểm tra lại trước khi gửi duyệt</b><p>Bạn vẫn có thể cập nhật hình ảnh và thông tin.</p></div><Button variant="outline">Chỉnh sửa bài đăng</Button><Button variant="gold" onClick={() => go(5)}>Tiếp tục gửi duyệt</Button></section>
    </UserShell>
  );
}

const listingRows = [
  ["Vang Bóng Một Thời", "18/08/2025", "3.500.000đ", "Chờ duyệt", "gold"],
  ["Truyện Kiều — Bản Nôm", "12/08/2025", "6.000.000đ", "Đã duyệt", "green"],
  ["Số Đỏ — Bản 1938", "08/08/2025", "5.500.000đ", "Đang đấu giá", "navy"],
  ["Thi Nhân Việt Nam", "01/08/2025", "2.800.000đ", "Từ chối", "red"],
  ["Dế Mèn Phiêu Lưu Ký", "24/07/2025", "4.000.000đ", "Đã kết thúc", "gray"],
];

function ListingManagementScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="section"><div className="section-head"><PageTitle eyebrow="Không gian người bán" title="Quản lý bài đăng" desc="Theo dõi trạng thái và hiệu quả các sách bạn đăng bán." /><Button variant="gold" onClick={() => go(3)}>Đăng sách mới</Button></div>
        <div className="stats-grid"><Card><span>Tổng bài đăng</span><strong>12</strong></Card><Card><span>Đang đấu giá</span><strong>03</strong></Card><Card><span>Lượt quan tâm</span><strong>428</strong></Card><Card><span>Doanh thu</span><strong>32,5 triệu</strong></Card></div>
      </section>
      <section className="section"><div className="tabs">{["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"].map((x, i) => <button className={i === 0 ? "active" : ""} key={x}>{x}</button>)}</div>
        <Card className="table-card"><table><thead><tr><th>Sách</th><th>Ngày đăng</th><th>Giá khởi điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{listingRows.map((r, i) => <tr key={r[0]}><td><div className="table-book"><img src={bookPhotos[i % 4]} alt="" /><b>{r[0]}</b></div>{i === 3 && <p className="reject-note">Lý do: Hình ảnh bản quyền chưa rõ</p>}</td><td>{r[1]}</td><td><b>{r[2]}</b></td><td><Badge tone={r[4]}>{r[3]}</Badge></td><td><div className="table-actions"><button>Xem</button><button>Sửa</button><button className="danger-link">Xóa</button></div></td></tr>)}</tbody></table></Card>
      </section>
    </UserShell>
  );
}

function BidList() {
  return <div className="bid-list">{[["Trần Minh K.", "6.200.000đ", "Vừa xong"], ["Bạn", "6.150.000đ", "1 phút trước"], ["Hoàng Anh T.", "6.000.000đ", "3 phút trước"], ["Lê Ngọc P.", "5.850.000đ", "8 phút trước"]].map((r, i) => <div className={i === 0 ? "leader" : ""} key={r[2]}><span className="avatar">{r[0].slice(0, 2)}</span><b>{r[0]}</b><strong>{r[1]}</strong><span>{r[2]}</span></div>)}</div>;
}

function LiveBidScreen({ go }: { go: (n: number) => void }) {
  const [leader, setLeader] = useState(false);
  return (
    <UserShell go={go}>
      <section className="live-head"><div><Badge tone="red">Trực tiếp</Badge><h1>Vang Bóng Một Thời</h1><p>Nguyễn Tuân • Bản in đầu tiên năm 1940</p></div><img src={bookPhotos[0]} alt="Bìa sách đấu giá" /></section>
      <section className="section live-layout">
        <div>
          <div className={`status-banner ${leader ? "win" : "lose"}`}><b>{leader ? "Bạn đang dẫn đầu" : "Bạn đã bị vượt giá"}</b><span>{leader ? "Giữ vững vị trí cho đến khi phiên kết thúc." : "Hãy đặt giá mới để quay lại vị trí dẫn đầu."}</span></div>
          <Card className="bid-panel"><span>Giá hiện tại</span><strong className="mega-price">6.200.000đ</strong><div className="mega-time"><span>Phiên kết thúc sau</span><b>02 : 14 : 38</b></div><Field label="Nhập giá của bạn" placeholder="6.250.000đ" /><p>Bước giá tối thiểu: 50.000đ</p><div className="quick-bids"><button>+50.000đ</button><button>+100.000đ</button><button>+200.000đ</button></div><Button variant="gold" onClick={() => setLeader(true)}>Xác nhận đặt giá</Button></Card>
        </div>
        <Card><div className="panel-head"><h2>Lịch sử đặt giá</h2><Badge tone="green">Đang cập nhật</Badge></div><BidList /><div className="bid-note">Giá được cập nhật theo thời gian thực. Mọi lượt đặt đều được ghi nhận minh bạch.</div></Card>
      </section>
    </UserShell>
  );
}

function AuctionResultScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="section"><PageTitle eyebrow="Phiên đấu giá đã kết thúc" title="Kết quả đấu giá" desc="Hai trạng thái kết quả giúp người dùng nhận biết rõ bước tiếp theo." /></section>
      <section className="section result-grid">
        <Card className="result-card winner"><div className="result-icon">✓</div><Badge tone="green">Bạn đã chiến thắng</Badge><h2>Chúc mừng Minh Anh!</h2><p>Bạn là người đặt giá cao nhất cho “Vang Bóng Một Thời”.</p><img src={bookPhotos[0]} alt="Sách thắng đấu giá" /><span>Giá thắng</span><strong>6.250.000đ</strong><Button variant="gold" onClick={() => go(8)}>Tiến hành giao dịch</Button></Card>
        <Card className="result-card empty"><div className="result-icon">—</div><Badge tone="gray">Không có người thắng</Badge><h2>Phiên đấu giá kết thúc,<br />không có người thắng</h2><p>Giá tối thiểu chưa được đáp ứng. Sách có thể được mở lại trong một phiên đấu giá khác.</p><Button variant="outline">Khám phá sách khác</Button></Card>
      </section>
    </UserShell>
  );
}

function TransactionScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="section"><PageTitle eyebrow="Mã giao dịch #BB-240819" title="Giao dịch và trò chuyện" desc="Trao đổi trực tiếp với người bán và hoàn tất giao dịch an toàn." />
        <div className="timeline">{["Đã thắng", "Đang trao đổi", "Đã thanh toán", "Hoàn tất"].map((x, i) => <div className={i < 2 ? "done" : ""} key={x}><b>{i < 2 ? "✓" : i + 1}</b><span>{x}</span></div>)}</div>
      </section>
      <section className="section transaction-layout">
        <Card className="transaction-info"><img src={bookPhotos[0]} alt="Sách giao dịch" /><h2>Vang Bóng Một Thời</h2><p>Người bán: Nguyễn Thành Nam</p><div><span>Giá thắng</span><strong>6.250.000đ</strong></div><div><span>Phương thức</span><b>Chuyển khoản an toàn</b></div><Button variant="success">Xác nhận hoàn tất giao dịch</Button><Button variant="danger">Báo cáo sự cố</Button></Card>
        <Card className="chat-card"><div className="chat-head"><div className="avatar">NT</div><div><h2>Nguyễn Thành Nam</h2><span>Đang hoạt động</span></div></div><div className="messages"><div className="bubble other">Chào bạn, cảm ơn bạn đã tham gia đấu giá. Tôi sẽ đóng gói sách thật cẩn thận.</div><div className="bubble mine">Cảm ơn anh. Anh có thể chụp thêm ảnh phần gáy sách trước khi gửi không?</div><div className="bubble other">Được nhé, tôi gửi bạn ngay đây.</div><div className="chat-image"><img src={bookPhotos[2]} alt="Ảnh gáy sách do người bán gửi" /></div></div><div className="message-input"><button aria-label="Đính kèm ảnh"><Icon name="image" /></button><input placeholder="Nhập tin nhắn..." /><Button>Gửi</Button></div></Card>
      </section>
    </UserShell>
  );
}

function RatingScreen({ go }: { go: (n: number) => void }) {
  const [rating, setRating] = useState(5);
  return (
    <UserShell go={go}>
      <section className="section narrow"><PageTitle eyebrow="Giao dịch đã hoàn tất" title="Đánh giá người bán" desc="Chia sẻ trải nghiệm để xây dựng cộng đồng BookBid đáng tin cậy." />
        <Card className="rating-card"><div className="seller-large"><div className="avatar">NT</div><div><h2>Nguyễn Thành Nam</h2><p>Người bán uy tín • 86 giao dịch</p></div><Badge tone="green">Đã xác minh</Badge></div><hr /><h3>Trải nghiệm của bạn thế nào?</h3><div className="stars" aria-label={`${rating} sao`}>{[1, 2, 3, 4, 5].map(x => <button onClick={() => setRating(x)} className={x <= rating ? "active" : ""} key={x}>★</button>)}</div><p className="rating-label">Rất hài lòng</p><h3>Điểm nổi bật</h3><div className="chips rating-chips">{["Đóng gói cẩn thận", "Đúng mô tả", "Giao nhanh", "Trao đổi thân thiện"].map(x => <button className="active" key={x}>✓ {x}</button>)}</div><label className="field"><span>Nhận xét của bạn</span><textarea placeholder="Hãy chia sẻ chi tiết trải nghiệm mua sách..." /></label><Button variant="gold">Gửi đánh giá</Button></Card>
      </section>
    </UserShell>
  );
}

function ComplaintScreen({ go }: { go: (n: number) => void }) {
  return (
    <UserShell go={go}>
      <section className="section"><PageTitle eyebrow="Trung tâm hỗ trợ" title="Gửi khiếu nại" desc="BookBid sẽ xem xét bằng chứng và phản hồi trong vòng 48 giờ." /></section>
      <section className="section complaint-layout">
        <Card><h2>Tạo khiếu nại mới</h2><SelectField label="Giao dịch" value="#BB-240819 — Vang Bóng Một Thời" /><SelectField label="Loại khiếu nại" value="Sách không đúng mô tả" /><label className="field"><span>Nội dung chi tiết</span><textarea placeholder="Mô tả vấn đề bạn gặp phải và phương án mong muốn..." /></label><UploadBox /><div className="form-actions-simple"><p>Bằng chứng rõ ràng giúp xử lý nhanh hơn.</p><Button variant="danger">Gửi khiếu nại</Button></div></Card>
        <Card><h2>Khiếu nại trước đây</h2><div className="complaint-list"><div><Badge tone="orange">Đang xử lý</Badge><h3>#KN-1082 — Giao hàng chậm</h3><p>Gửi ngày 12/08/2025</p><b>Phản hồi dự kiến: 20/08/2025</b></div><div><Badge tone="green">Đã giải quyết</Badge><h3>#KN-0941 — Thiếu phụ kiện</h3><p>Gửi ngày 24/06/2025</p><b>Đã hoàn tiền 350.000đ</b></div></div></Card>
      </section>
    </UserShell>
  );
}

function AdminScreen() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar"><div className="logo logo-light"><span>B</span>BookBid</div><Badge tone="gold">Quản trị viên</Badge><nav>{["Tổng quan", "Người dùng", "Kiểm duyệt bài đăng", "Phiên đấu giá", "Khiếu nại"].map((x, i) => <button className={i === 0 ? "active" : ""} key={x}><i>{i + 1}</i>{x}</button>)}</nav><div className="admin-user"><div className="avatar">QT</div><span><b>Quản trị viên</b><small>admin@bookbid.vn</small></span></div></aside>
      <main className="admin-main">
        <div className="admin-top"><PageTitle eyebrow="Trung tâm điều hành" title="Tổng quan hệ thống" desc="Dữ liệu cập nhật lúc 10:32, ngày 19/08/2025" /><Button variant="outline">Xuất báo cáo</Button></div>
        <div className="kpi-grid"><Card><span>Người dùng</span><strong>12.486</strong><b>+12,5% tháng này</b></Card><Card><span>Bài chờ duyệt</span><strong>24</strong><b>Cần xử lý hôm nay</b></Card><Card><span>Phiên đang chạy</span><strong>186</strong><b>Ổn định</b></Card><Card><span>Giá trị giao dịch</span><strong>2,48 tỷ</strong><b>+18,2% tháng này</b></Card></div>
        <div className="admin-grid"><Card className="chart-card"><div className="panel-head"><h2>Giao dịch 7 ngày qua</h2><Badge tone="green">+18,2%</Badge></div><div className="chart">{[42, 58, 51, 72, 65, 88, 78].map((n, i) => <div key={i}><i style={{ height: `${n}%` }} /><span>T{i + 2}</span></div>)}</div></Card><Card><h2>Phân bổ trạng thái</h2><div className="donut"><div><strong>1.248</strong><span>Tổng bài</span></div></div><div className="legend"><span><i className="dot green" />Đã duyệt 68%</span><span><i className="dot gold" />Chờ duyệt 22%</span><span><i className="dot red" />Từ chối 10%</span></div></Card></div>
        <section className="admin-section"><div className="section-head"><h2>Kiểm duyệt bài đăng</h2><Button variant="outline">Xem 24 bài chờ</Button></div><div className="moderation-grid"><Card className="compact-table"><table><thead><tr><th>Sách</th><th>Người đăng</th><th>AI</th></tr></thead><tbody>{books.slice(0, 3).map((b, i) => <tr className={i === 0 ? "selected" : ""} key={b.title}><td><div className="table-book"><img src={bookPhotos[i]} alt="" /><b>{b.title}</b></div></td><td>{["Nguyễn Hoàng", "Trần Minh", "Lê Anh"][i]}</td><td><Badge tone="navy">{b.score}</Badge></td></tr>)}</tbody></table></Card><Card className="review-panel"><div className="review-gallery"><img src={bookPhotos[0]} alt="Ảnh sách kiểm duyệt" /><div><img src={bookPhotos[1]} alt="" /><img src={bookPhotos[2]} alt="" /></div></div><h2>Vang Bóng Một Thời</h2><p>Nguyễn Tuân • Tân Dân • 1940</p><div className="ai-summary"><b>Điểm hiếm AI: 8,5/10</b><span>Tình trạng tốt 85% • Xác thực 94%</span><strong>Cảnh báo: Năm xuất bản cần đối chiếu</strong></div><label className="field"><span>Lý do / Ghi chú kiểm duyệt</span><input placeholder="Nhập lý do nếu từ chối..." /></label><div className="review-actions"><Button variant="success">Duyệt</Button><Button variant="danger">Từ chối</Button><Button variant="outline">Yêu cầu bổ sung</Button></div></Card></div></section>
        <section className="admin-section"><h2>Quản lý khiếu nại</h2><Card className="table-card"><table><thead><tr><th>Mã</th><th>Nội dung</th><th>Người gửi</th><th>Trạng thái</th><th>Xử lý</th></tr></thead><tbody><tr><td>#KN-1082</td><td><b>Giao hàng chậm</b></td><td>Phạm Lan</td><td><Badge tone="orange">Đang xử lý</Badge></td><td><div className="table-actions"><button>Chấp nhận</button><button>Bác bỏ</button></div></td></tr><tr><td>#KN-1081</td><td><b>Sách sai mô tả</b></td><td>Minh Anh</td><td><Badge tone="red">Mới</Badge></td><td><div className="table-actions"><button>Chấp nhận</button><button>Bác bỏ</button></div></td></tr></tbody></table></Card></section>
        <section className="admin-section"><h2>Người dùng gần đây</h2><Card className="table-card"><table><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Giao dịch</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{["Nguyễn Thành Nam", "Lê Minh Anh"].map((x, i) => <tr key={x}><td><b>{x}</b></td><td>{i ? "Người mua" : "Người bán"}</td><td>{i ? "12" : "86"}</td><td><Badge tone={i ? "red" : "green"}>{i ? "Đã khóa" : "Hoạt động"}</Badge></td><td><Button variant="outline">{i ? "Mở khóa" : "Khóa"}</Button></td></tr>)}</tbody></table></Card></section>
      </main>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(1);
  const render = () => {
    switch (screen) {
      case 0: return <AuthScreen />;
      case 1: return <HomeScreen go={setScreen} />;
      case 2: return <DetailScreen go={setScreen} />;
      case 3: return <CreateListingScreen go={setScreen} />;
      case 4: return <AnalysisScreen go={setScreen} />;
      case 5: return <ListingManagementScreen go={setScreen} />;
      case 6: return <LiveBidScreen go={setScreen} />;
      case 7: return <AuctionResultScreen go={setScreen} />;
      case 8: return <TransactionScreen go={setScreen} />;
      case 9: return <RatingScreen go={setScreen} />;
      case 10: return <ComplaintScreen go={setScreen} />;
      case 11: return <AdminScreen />;
      default: return null;
    }
  };
  return <div className="app">{render()}</div>;
}
