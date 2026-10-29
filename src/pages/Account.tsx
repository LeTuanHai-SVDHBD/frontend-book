import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { go } from "../lib/router";
import {
  Badge,
  Button,
  Icon,
  LinkButton,
  Notice,
  PageHeading,
  Panel,
} from "../components/ui";
export default function Account() {
  const { user, run, explain } = useDemo(),
    [mode, setMode] = useState<"login" | "register">("login"),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [error, setError] = useState(""),
    [registered, setRegistered] = useState(false);
  if (user)
    return (
      <div className="page-container">
        <PageHeading
          eyebrow="Tài khoản của bạn"
          title={`Chào ${user.name.split(" ").slice(-2).join(" ")}`}
          description={
            user.role === "admin"
              ? "Không gian kiểm duyệt bài đăng và xử lý khiếu nại."
              : "Một tài khoản cho cả hoạt động mua và bán sách."
          }
        />
        <div className="profile-layout">
          <Panel className="profile-card">
            <span className="avatar large-avatar">{user.initials}</span>
            <h2>{user.name}</h2>
            <Badge tone={user.role === "admin" ? "navy" : "green"}>
              {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
            </Badge>
            <dl className="summary-list">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Số điện thoại</dt>
                <dd>Chưa cung cấp</dd>
              </div>
              <div>
                <dt>Địa chỉ</dt>
                <dd>Chưa cung cấp</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              icon="logout"
              onClick={() => {
                run(
                  { type: "viewer", value: "guest" },
                  "Đã đăng xuất khỏi bản xem trước.",
                );
                setPassword("");
                go({ page: "account" });
              }}
            >
              Đăng xuất
            </Button>
          </Panel>
          <div>
            <Panel className="profile-shortcuts">
              <h2>Tiếp tục hành trình của bạn</h2>
              {(user.role === "admin"
                ? [
                    {
                      title: "Kiểm duyệt bài đăng",
                      text: "Đối chiếu bằng chứng và kết quả AI.",
                      page: "moderation" as const,
                      icon: "file" as const,
                    },
                    {
                      title: "Xử lý khiếu nại",
                      text: "Tiếp nhận đúng hồ sơ được phân công.",
                      page: "admin-complaints" as const,
                      icon: "shield" as const,
                    },
                  ]
                : [
                    {
                      title: "Bài đăng của tôi",
                      text: "Theo dõi duyệt và đặt lịch kích hoạt.",
                      page: "mine" as const,
                      icon: "book" as const,
                    },
                    {
                      title: "Giao dịch và trao đổi",
                      text: "Chat riêng, xác nhận hai bên, đánh giá.",
                      page: "trades" as const,
                      icon: "chat" as const,
                    },
                    {
                      title: "Khiếu nại của tôi",
                      text: "Bằng chứng và phản hồi đã được giữ lại.",
                      page: "complaints" as const,
                      icon: "shield" as const,
                    },
                  ]
              ).map((item) => (
                <LinkButton
                  key={item.page}
                  to={{ page: item.page }}
                  variant="ghost"
                  icon={item.icon}
                >
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </LinkButton>
              ))}
            </Panel>
            <Notice>
              Đăng nhập cùng tài khoản ở cửa sổ hoặc thiết bị mới sẽ thu hồi
              phiên cũ. F5 không tự đăng nhập lại phiên đã bị thu hồi.
            </Notice>
          </div>
        </div>
      </div>
    );
  return (
    <div className="auth-layout">
      <section className="auth-editorial">
        <p className="eyebrow">BookBid · Dành cho người yêu sách</p>
        <h1>
          Những câu chuyện cũ.
          <br />
          <em>Những kết nối mới.</em>
        </h1>
        <p>
          Đăng nhập để tham gia đấu giá, chia sẻ bản sách của bạn và gặp gỡ
          người cùng trân trọng.
        </p>
        <div className="auth-book-stack">
          <img src="/covers/book-4.svg" alt="Bìa minh họa Thi Nhân Việt Nam" />
          <img src="/covers/book-2.svg" alt="Bìa minh họa Truyện Kiều" />
        </div>
        <span>
          <Icon name="shield" size={18} />
          AI hỗ trợ kiểm duyệt · Admin quyết định
        </span>
      </section>
      <section className="auth-form-column">
        <div className="auth-card">
          <div className="tabs" role="tablist" aria-label="Tài khoản">
            <button
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError("");
                setPassword("");
              }}
            >
              Đăng nhập
            </button>
            <button
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setError("");
                setPassword("");
              }}
            >
              Đăng ký
            </button>
          </div>
          <h2>
            {mode === "login"
              ? "Chào mừng trở lại"
              : "Bắt đầu hành trình yêu sách"}
          </h2>
          <p>
            {mode === "login"
              ? "Đến với những ấn bản và câu chuyện dành cho bạn."
              : "Tạo tài khoản để mua và đăng sách trong cùng một không gian."}
          </p>
          {registered && (
            <Notice tone="success">
              Biểu mẫu đăng ký mẫu đã hợp lệ. Bạn có thể xem thử màn hình đăng
              nhập.
            </Notice>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (mode === "register" && password !== confirmation) {
                setError("Hai mật khẩu chưa khớp.");
                return;
              }
              setRegistered(false);
              explain(
                "Đây là thiết kế đăng nhập/đăng ký. Chọn vai trò mẫu ở thanh trên để xem giao diện; chưa tạo tài khoản hoặc phiên đăng nhập thật.",
              );
            }}
          >
            {mode === "register" && (
              <label className="field">
                <span>Họ và tên</span>
                <input
                  name="ho_ten"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Họ và tên của bạn"
                />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                placeholder="ban@example.com"
              />
            </label>
            <label className="field">
              <span>Mật khẩu</span>
              <input
                name="mat_khau"
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={mode === "register" ? 12 : 1}
                maxLength={128}
                placeholder={
                  mode === "register" ? "Từ 12 đến 128 ký tự" : "Nhập mật khẩu"
                }
              />
            </label>
            {mode === "register" && (
              <label className="field">
                <span>Xác nhận mật khẩu</span>
                <input
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="gold">
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </Button>
          </form>
          <p className="auth-prototype-note">
            Biểu mẫu minh họa để duyệt thiết kế, không gửi thông tin đến
            Backend.
          </p>
          <LinkButton to={{ page: "catalog" }} variant="ghost">
            Tiếp tục khám phá với tư cách khách
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
