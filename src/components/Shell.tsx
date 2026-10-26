import { useState, type ReactNode } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { Route, Viewer } from "../domain/types";
import { go, href } from "../lib/router";
import { Button, Dialog, Icon } from "./ui";
export function PreviewBar({ route }: { route: Route }) {
  const { state, run, reset } = useDemo(),
    [open, setOpen] = useState(false);
  return (
    <>
      <div className="preview-bar">
        <span>
          <span className="preview-dot" />
          Bản xem trước thiết kế{" "}
          <span className="preview-detail">
            · Dữ liệu minh họa, chưa kết nối Backend
          </span>
        </span>
        <div>
          <label>
            Xem với{" "}
            <select
              aria-label="Vai trò xem trước"
              value={state.viewer}
              onChange={(event) => {
                run({ type: "viewer", value: event.target.value as Viewer });
              }}
            >
              <option value="guest">Khách</option>
              <option value="buyer">Người mua · Minh An</option>
              <option value="seller">Chủ sách · Thành Nam</option>
              <option value="admin">Admin · Phương</option>
              <option value="admin-other">Admin khác · Huy</option>
            </select>
          </label>
          <button
            onClick={() => setOpen(true)}
            aria-label="Mở trạng thái thiết kế"
          >
            <Icon name="grid" size={14} />
            <span>Trạng thái mẫu</span>
          </button>
        </div>
      </div>
      {open && (
        <Dialog
          title="Khám phá các trạng thái giao diện"
          onClose={() => setOpen(false)}
        >
          <p>
            Chỉ điều khiển dữ liệu minh họa trong trình duyệt này. Không gửi yêu
            cầu đến dự án chính.
          </p>
          <label className="field">
            <span>Kết nối phiên</span>
            <select
              value={state.connection}
              onChange={(event) =>
                run({
                  type: "connection",
                  value: event.target.value as "online" | "offline",
                })
              }
            >
              <option value="online">Đã kết nối</option>
              <option value="offline">Mất kết nối / lấy lại trạng thái</option>
            </select>
          </label>
          <label className="field">
            <span>Phản hồi khi gửi mức giá</span>
            <select
              value={state.resultMode}
              onChange={(event) =>
                run({
                  type: "mode",
                  value: event.target.value as typeof state.resultMode,
                })
              }
            >
              <option value="accept">
                Xử lý theo bước giá và thời gian chờ
              </option>
              <option value="reject">Bị từ chối vì giá thay đổi</option>
              <option value="delay">
                Đang chờ xử lý / thử lại cùng yêu cầu
              </option>
            </select>
          </label>
          {route.page === "auction" && (
            <>
              <h3>Trạng thái phiên đang xem</h3>
              <div className="button-row">
                {(
                  [
                    ["scheduled", "Chưa bắt đầu"],
                    ["winner", "Hết giờ có người thắng"],
                    ["empty", "Không có người thắng"],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    small
                    key={value}
                    variant="outline"
                    onClick={() => {
                      run({ type: "scenario", auctionId: route.id, value });
                      setOpen(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          )}
          <div className="divider" />
          <div className="button-row">
            <Button
              variant="outline"
              onClick={() => {
                run(
                  { type: "viewer", value: "guest" },
                  "Tài khoản đã được đăng nhập ở cửa sổ khác. Bạn đã được đăng xuất.",
                );
                go({ page: "account" });
                setOpen(false);
              }}
            >
              Xem màn hình thu hồi phiên
            </Button>
            <Button
              onClick={() => {
                reset();
                go({ page: "home" });
                setOpen(false);
              }}
            >
              Khôi phục dữ liệu mẫu
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
export default function Shell({
  route,
  children,
}: {
  route: Route;
  children: ReactNode;
}) {
  const { user } = useDemo(),
    [menu, setMenu] = useState(false),
    [help, setHelp] = useState(false);
  const admin = user?.role === "admin";
  const links: { route: Route; label: string }[] = admin
    ? [
        { route: { page: "moderation" }, label: "Kiểm duyệt" },
        { route: { page: "admin-complaints" }, label: "Khiếu nại" },
        { route: { page: "catalog" }, label: "Danh mục" },
        { route: { page: "system" }, label: "Hệ thống" },
      ]
    : [
        { route: { page: "catalog" }, label: "Khám phá" },
        ...(user
          ? [
              { route: { page: "mine" } as Route, label: "Bài của tôi" },
              { route: { page: "trades" } as Route, label: "Giao dịch" },
              { route: { page: "complaints" } as Route, label: "Khiếu nại" },
            ]
          : []),
      ];
  const active = (page: Route["page"]) =>
    page === route.page ||
    (page === "catalog" && route.page === "auction") ||
    (page === "mine" &&
      ["listing", "edit", "relist", "create"].includes(route.page)) ||
    (page === "trades" && route.page === "trade") ||
    ((page === "complaints" || page === "admin-complaints") &&
      route.page === "complaint");
  return (
    <>
      <PreviewBar route={route} />
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
      <header className="site-header">
        <div className="header-inner">
          <a
            href={href({ page: "home" })}
            className="brand"
            aria-label="BookBid · Trang chủ"
          >
            <span className="brand-mark">
              <Icon name="book" size={23} />
            </span>
            <strong>
              BookBid<span>.</span>
            </strong>
          </a>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {links.map((item) => (
              <a
                key={item.label}
                href={href(item.route)}
                aria-current={active(item.route.page) ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            {user && !admin && (
              <a
                className="btn btn-primary btn-small create-cta"
                href={href({ page: "create" })}
              >
                <Icon name="plus" size={16} />
                Đăng sách
              </a>
            )}
            {user ? (
              <a
                href={href({ page: "account" })}
                className="account-link"
                aria-label={`Tài khoản ${user.name}`}
              >
                <span className="avatar">{user.initials}</span>
                <span>
                  {user.name.split(" ").slice(-2).join(" ")}
                  <small>{admin ? "Quản trị viên" : "Tài khoản của tôi"}</small>
                </span>
              </a>
            ) : (
              <a
                href={href({ page: "account" })}
                className="btn btn-primary btn-small"
              >
                Đăng nhập
              </a>
            )}
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
                key={item.label}
                href={href(item.route)}
                aria-current={active(item.route.page) ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
            {user && !admin && (
              <a href={href({ page: "create" })} onClick={() => setMenu(false)}>
                Đăng sách mới
              </a>
            )}
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div>
          <a href={href({ page: "home" })} className="brand">
            <span className="brand-mark">
              <Icon name="book" size={22} />
            </span>
            <strong>BookBid.</strong>
          </a>
          <p>
            Kết nối những người yêu sách,
            <br />
            gìn giữ những ấn bản có giá trị.
          </p>
        </div>
        <div>
          <strong>Khám phá</strong>
          <a href={href({ page: "catalog" })}>Các phiên đấu giá</a>
          <button onClick={() => setHelp(true)}>Quy trình tham gia</button>
        </div>
        <div>
          <strong>Không gian của bạn</strong>
          <a
            href={href(
              user
                ? { page: admin ? "moderation" : "mine" }
                : { page: "account" },
            )}
          >
            {admin ? "Kiểm duyệt sách" : "Quản lý bài đăng"}
          </a>
          <a
            href={href(
              user
                ? { page: admin ? "admin-complaints" : "complaints" }
                : { page: "account" },
            )}
          >
            Theo dõi khiếu nại
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BookBid · Nhóm 15</span>
          <span>
            Bản thiết kế tương tác · Đối chiếu chức năng đến giao dịch và phản
            hồi
          </span>
        </div>
      </footer>
      {help && (
        <Dialog
          title="Từ một bản sách đến một cuộc đấu giá"
          onClose={() => setHelp(false)}
        >
          <ol className="help-steps">
            <li>
              <b>Đăng sách và bằng chứng</b>
              <p>
                Cung cấp thông tin, ảnh/video, giá khởi điểm, bước giá và thời
                gian chờ.
              </p>
            </li>
            <li>
              <b>Admin kiểm duyệt</b>
              <p>
                AI hỗ trợ hai điểm độc lập. Admin đối chiếu bằng chứng và quyết
                định có lý do.
              </p>
            </li>
            <li>
              <b>Chủ sách đặt lịch, kích hoạt</b>
              <p>
                Chỉ bài đã duyệt mới được kích hoạt. Phiên kết thúc khi hết giờ
                hoặc đạt điều kiện kết thúc sớm.
              </p>
            </li>
            <li>
              <b>Trao đổi và hoàn tất</b>
              <p>
                Người thắng và người bán xác nhận riêng. Đủ hai bên mới hoàn
                tất; sau đó người mua đánh giá.
              </p>
            </li>
          </ol>
          <Button onClick={() => setHelp(false)}>Đã hiểu</Button>
        </Dialog>
      )}
    </>
  );
}
