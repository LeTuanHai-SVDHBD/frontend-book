import { useEffect, useState, type ReactNode } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { Route, Viewer } from "../domain/types";
import { go, href } from "../lib/router";
import { Button, Dialog, Icon } from "./ui";
const screens: { title: string; route: Route; viewer: Viewer }[] = [
  { title: "Trang chủ", route: { page: "home" }, viewer: "buyer" },
  { title: "Danh mục sách", route: { page: "catalog" }, viewer: "buyer" },
  {
    title: "Chi tiết sách đang đấu giá",
    route: { page: "auction", id: 101 },
    viewer: "buyer",
  },
  {
    title: "Phiên sắp bắt đầu",
    route: { page: "auction", id: 103 },
    viewer: "buyer",
  },
  {
    title: "Kết quả có người thắng",
    route: { page: "auction", id: 105 },
    viewer: "buyer",
  },
  {
    title: "Kết quả không người thắng",
    route: { page: "auction", id: 106 },
    viewer: "seller",
  },
  { title: "Đăng sách", route: { page: "create" }, viewer: "seller" },
  { title: "Quản lý bài đăng", route: { page: "mine" }, viewer: "seller" },
  {
    title: "Phân tích AI riêng",
    route: { page: "listing", id: 107 },
    viewer: "seller",
  },
  {
    title: "Bổ sung bài bị từ chối",
    route: { page: "edit", id: 108 },
    viewer: "seller",
  },
  {
    title: "Kích hoạt bài đã duyệt",
    route: { page: "listing", id: 109 },
    viewer: "seller",
  },
  {
    title: "Giao dịch và trò chuyện",
    route: { page: "trade", id: 301 },
    viewer: "buyer",
  },
  {
    title: "Khiếu nại",
    route: { page: "complaint", id: 501 },
    viewer: "buyer",
  },
  {
    title: "Admin · Kiểm duyệt",
    route: { page: "moderation" },
    viewer: "admin",
  },
  {
    title: "Admin · Khiếu nại",
    route: { page: "admin-complaints" },
    viewer: "admin",
  },
  { title: "Đăng nhập / Đăng ký", route: { page: "account" }, viewer: "guest" },
];
export default function Shell({
  route,
  children,
}: {
  route: Route;
  children: ReactNode;
}) {
  const { state, user, run, views, setView, explain } = useDemo(),
    [menu, setMenu] = useState(false),
    [notifications, setNotifications] = useState(false),
    [presets, setPresets] = useState(false),
    [query, setQuery] = useState("");
  const admin = user?.role === "admin";
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1101px)");
    const closeDrawer = () => {
      if (desktop.matches) setMenu(false);
    };
    desktop.addEventListener("change", closeDrawer);
    return () => desktop.removeEventListener("change", closeDrawer);
  }, []);
  const links: { title: string; route: Route }[] = [
    { title: "Trang chủ", route: { page: "home" } },
    { title: "Đấu giá", route: { page: "catalog" } },
    { title: "Đăng sách", route: { page: "create" } },
    { title: "Bài đăng của tôi", route: { page: "mine" } },
  ];
  const notificationItems = (
    <>
      <p className="notification-note">
        Thiết kế mẫu · Chưa có chức năng thông báo thật
      </p>
      {(admin
        ? [
            {
              icon: "file" as const,
              title: "Có bài đăng chờ kiểm duyệt",
              text: "Hồ sơ Việt Nam Văn Hóa Sử Cương đang chờ đối chiếu.",
              time: "5 phút trước",
            },
            {
              icon: "shield" as const,
              title: "Có khiếu nại mới",
              text: "Hồ sơ #501 đang chờ Admin tiếp nhận.",
              time: "1 giờ trước",
            },
            {
              icon: "grid" as const,
              title: "Có kết quả phân tích AI",
              text: "Mở hồ sơ riêng để kiểm tra bằng chứng và hai điểm hỗ trợ.",
              time: "2 giờ trước",
            },
          ]
        : [
            {
              icon: "gavel" as const,
              title: "Phiên đấu giá sắp kết thúc",
              text: "Vang Bóng Một Thời còn 35 phút.",
              time: "5 phút trước",
            },
            {
              icon: "file" as const,
              title: "Bài đăng đã được duyệt",
              text: "Bạn có thể thiết lập lịch và kích hoạt phiên.",
              time: "1 giờ trước",
            },
            {
              icon: "chat" as const,
              title: "Tin nhắn trong giao dịch",
              text: "Nguyễn Thành Nam đã gửi một tin nhắn.",
              time: "2 giờ trước",
            },
          ]
      ).map((item) => (
        <div className="notification-item" key={item.title}>
          <span>
            <Icon name={item.icon} />
          </span>
          <div>
            <b>{item.title}</b>
            <p>{item.text}</p>
            <small>{item.time}</small>
          </div>
        </div>
      ))}
      <button
        className="notification-all"
        onClick={() => {
          setNotifications(false);
          setMenu(false);
          explain(
            "Dự kiến bổ sung: danh sách thông báo, trạng thái đã đọc/chưa đọc và điều hướng tới đúng hồ sơ, phiên hoặc giao dịch. Hiện chỉ duyệt thiết kế.",
          );
        }}
      >
        Xem tất cả thông báo
      </button>
    </>
  );
  const adminNavigation = user && (
    <>
      <a href="#/moderation" className="brand" onClick={() => setMenu(false)}>
        <span className="brand-mark">B</span>
        <strong>BookBid</strong>
      </a>
      <span className="badge badge-gold">Quản trị viên</span>
      <button
        className="admin-notification-trigger"
        aria-label="Thông báo"
        aria-haspopup="dialog"
        aria-expanded={notifications}
        onClick={() => setNotifications(true)}
      >
        <span className="notification-trigger">
          <Icon name="bell" size={25} />
          <i />
        </span>
        <span>
          Thông báo<small>Thông báo mẫu</small>
        </span>
        <span className="admin-notification-count" aria-label="3 thông báo mẫu">
          3
        </span>
      </button>
      <nav aria-label="Điều hướng quản trị">
        {[
          {
            title: "Kiểm duyệt bài đăng",
            page: "moderation",
            icon: "file" as const,
          },
          {
            title: "Khiếu nại",
            page: "admin-complaints",
            icon: "shield" as const,
          },
          { title: "Phiên đấu giá", page: "catalog", icon: "book" as const },
          {
            title: "Trạng thái hệ thống",
            page: "system",
            icon: "grid" as const,
          },
        ].map((item) => (
          <a
            key={item.page}
            href={`#/${item.page}`}
            aria-current={
              route.page === item.page ||
              (item.page === "admin-complaints" && route.page === "complaint")
                ? "page"
                : undefined
            }
            onClick={() => setMenu(false)}
          >
            <Icon name={item.icon} />
            {item.title}
          </a>
        ))}
      </nav>
      <a
        href="#/account"
        className="admin-account"
        aria-label={`Tài khoản Admin · ${user.name}`}
        aria-current={route.page === "account" ? "page" : undefined}
        onClick={() => setMenu(false)}
      >
        <span className="avatar">{user.initials}</span>
        <span>
          <b>{user.name}</b>
          <small>Tài khoản quản trị</small>
        </span>
        <Icon name="chevron" size={18} />
      </a>
    </>
  );
  return (
    <>
      <div className="preview-bar">
        <span>
          <span className="preview-dot" /> BẢN THIẾT KẾ · DỮ LIỆU MẪU
        </span>
        <div>
          <select
            aria-label="Màn hình mẫu"
            value=""
            onChange={(event) => {
              const chosen = screens[Number(event.target.value)];
              run({ type: "viewer", value: chosen.viewer });
              go(chosen.route);
            }}
          >
            <option value="" disabled>
              Chọn màn hình để xem
            </option>
            {screens.map((screen, index) => (
              <option value={index} key={screen.title}>
                {screen.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Vai trò xem trước"
            value={state.viewer}
            onChange={(event) =>
              run({ type: "viewer", value: event.target.value as Viewer })
            }
          >
            <option value="guest">Khách</option>
            <option value="buyer">Người mua · Minh An</option>
            <option value="seller">Chủ sách · Thành Nam</option>
            <option value="admin">Admin · Phương</option>
            <option value="admin-other">Admin · Huy</option>
          </select>
          <button
            aria-label="Mở trạng thái thiết kế"
            onClick={() => setPresets(true)}
          >
            <Icon name="grid" />
            <span>Trạng thái mẫu</span>
          </button>
        </div>
      </div>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Đến nội dung chính
      </a>
      {!admin && (
        <header className="site-header">
          <div className="header-inner">
            <a
              className="brand"
              href={href({ page: "home" })}
              aria-label="BookBid · Trang chủ"
            >
              <span className="brand-mark">B</span>
              <strong>BookBid</strong>
            </a>
            <form
              className="nav-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                explain(
                  "Ô tìm kiếm toàn hệ thống — thiết kế trước. Sau này bổ sung tìm theo tên sách, tác giả, ISBN và bộ lọc tại Backend.",
                );
              }}
            >
              <Icon name="search" size={25} />
              <input
                aria-label="Tìm kiếm toàn hệ thống"
                placeholder="Tìm sách, tác giả, ISBN..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button aria-label="Tìm kiếm mẫu" type="submit">
                <Icon name="arrow" size={22} />
              </button>
            </form>
            <nav className="desktop-nav" aria-label="Điều hướng chính">
              {links.map((item) => (
                <a
                  key={item.title}
                  href={href(item.route)}
                  aria-current={
                    route.page === item.route.page ? "page" : undefined
                  }
                >
                  {item.title}
                </a>
              ))}
            </nav>
            <div className="header-actions">
              <button
                className="notification-trigger icon-button"
                aria-label="Thông báo"
                aria-expanded={notifications}
                onClick={() => setNotifications((value) => !value)}
              >
                <Icon name="bell" size={27} />
                <i />
              </button>
              <a
                href={href({ page: "account" })}
                className="avatar"
                aria-label="Tài khoản"
              >
                {user?.initials || "LA"}
              </a>
              <button
                className="icon-button mobile-menu"
                aria-label="Mở điều hướng"
                aria-expanded={menu}
                onClick={() => setMenu((value) => !value)}
              >
                <Icon name={menu ? "close" : "menu"} />
              </button>
            </div>
          </div>
          {menu && (
            <nav className="mobile-nav" aria-label="Điều hướng di động">
              {links.map((item) => (
                <a
                  key={item.title}
                  href={href(item.route)}
                  onClick={() => setMenu(false)}
                >
                  {item.title}
                </a>
              ))}
              <a href="#/trades" onClick={() => setMenu(false)}>
                Giao dịch
              </a>
              <a href="#/complaints" onClick={() => setMenu(false)}>
                Khiếu nại
              </a>
            </nav>
          )}
          {notifications && (
            <section className="notification-panel" aria-label="Thông báo mẫu">
              <header>
                <h2>Thông báo</h2>
                <button
                  className="icon-button"
                  aria-label="Đóng thông báo mẫu"
                  onClick={() => setNotifications(false)}
                >
                  ×
                </button>
              </header>
              {notificationItems}
            </section>
          )}
        </header>
      )}
      {admin && (
        <>
          <aside
            className="figma-admin-sidebar"
            aria-label="Thanh điều hướng quản trị"
          >
            {adminNavigation}
          </aside>
          <div className="admin-mobile-menu">
            <button
              className="admin-menu-toggle"
              aria-label="Mở điều hướng quản trị"
              aria-haspopup="dialog"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              <Icon name="menu" /> Menu quản trị
            </button>
          </div>
          {menu && (
            <Dialog
              title="Điều hướng quản trị"
              className="admin-navigation-drawer"
              onClose={() => setMenu(false)}
            >
              <div className="figma-admin-sidebar">{adminNavigation}</div>
            </Dialog>
          )}
          {notifications && (
            <Dialog
              title="Thông báo"
              className="admin-notifications"
              onClose={() => setNotifications(false)}
            >
              {notificationItems}
            </Dialog>
          )}
        </>
      )}
      <div className={admin ? "admin-content-wrap" : ""}>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <div>
            <a href="#/home" className="brand">
              <span className="brand-mark">B</span>
              <strong>BookBid</strong>
            </a>
            <p>
              Nền tảng đấu giá sách, kết nối những người cùng trân trọng giá trị
              của từng bản sách.
            </p>
          </div>
          <div>
            <strong>Khám phá</strong>
            <a href="#/catalog">Các phiên đấu giá</a>
            <a href="#/auction/101">Chi tiết sách mẫu</a>
          </div>
          <div>
            <strong>
              {admin ? "Không gian quản trị" : "Không gian của bạn"}
            </strong>
            {admin ? (
              <>
                <a href="#/moderation">Kiểm duyệt bài đăng</a>
                <a href="#/admin-complaints">Xử lý khiếu nại</a>
                <a href="#/account">Tài khoản quản trị</a>
              </>
            ) : (
              <>
                <a href="#/mine">Quản lý bài đăng</a>
                <a href="#/trades">Giao dịch và trò chuyện</a>
                <a href="#/complaints">Khiếu nại của tôi</a>
              </>
            )}
          </div>
          <div>
            <strong>Thiết kế BookBid</strong>
            <p>
              Dữ liệu mẫu để duyệt giao diện. Các chức năng sẽ được tích hợp sau
              khi chốt thiết kế.
            </p>
          </div>
          <div className="footer-bottom">
            <span>© 2026 BookBid · Nhóm 15</span>
            <span>Giữ phong cách Figma gốc · Bản thiết kế</span>
          </div>
        </footer>
      </div>
      {presets && (
        <Dialog
          title="Xem các trạng thái mẫu"
          onClose={() => setPresets(false)}
        >
          <p>
            Chọn sẵn cách hiển thị để duyệt giao diện. Không thực hiện đặt giá,
            xác nhận hoặc xử lý hồ sơ.
          </p>
          <label className="field">
            <span>Khung đặt giá</span>
            <select
              aria-label="Trạng thái đặt giá mẫu"
              value={views.bid}
              onChange={(event) =>
                setView("bid", event.target.value as typeof views.bid)
              }
            >
              {[
                ["ready", "Sẵn sàng nhập giá"],
                ["pending", "Đang chờ xử lý"],
                ["accepted", "Được chấp nhận"],
                ["rejected", "Bị từ chối"],
                ["cooldown", "Đang chờ đặt lại"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Giao dịch và đánh giá</span>
            <select
              aria-label="Trạng thái giao dịch mẫu"
              value={views.trade}
              onChange={(event) =>
                setView("trade", event.target.value as typeof views.trade)
              }
            >
              {[
                ["waiting", "Chờ hai bên xác nhận"],
                ["buyer-confirmed", "Người mua đã xác nhận"],
                ["completed", "Hoàn tất · Chưa đánh giá"],
                ["reviewed", "Hoàn tất · Đã đánh giá"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Khiếu nại và phân công Admin</span>
            <select
              aria-label="Trạng thái khiếu nại mẫu"
              value={views.complaint}
              onChange={(event) =>
                setView(
                  "complaint",
                  event.target.value as typeof views.complaint,
                )
              }
            >
              {[
                ["waiting", "Chờ tiếp nhận"],
                ["assigned", "Đang xử lý · Giao Admin Phương"],
                ["resolved", "Đã xử lý"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Phân tích AI</span>
            <select
              aria-label="Trạng thái AI mẫu"
              value={views.ai}
              onChange={(event) =>
                setView("ai", event.target.value as typeof views.ai)
              }
            >
              {[
                ["partial", "Có độ hiếm · Vật lý NULL"],
                ["queued", "Đang chờ phân tích"],
                ["error", "Phân tích thất bại"],
                ["off", "AI đang tắt"],
              ].map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={() => setPresets(false)}>Xem thiết kế</Button>
        </Dialog>
      )}
    </>
  );
}
