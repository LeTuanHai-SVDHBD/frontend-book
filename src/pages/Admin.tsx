import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { userName } from "../demo/fixtures";
import { money } from "../lib/format";
import {
  Badge,
  Button,
  EmptyState,
  Icon,
  LinkButton,
  ListingBadge,
  Notice,
  PageHeading,
  Panel,
} from "../components/ui";
import AnalysisPanel from "../components/AnalysisPanel";
export default function Admin() {
  const { state, user, run } = useDemo(),
    pending = state.auctions.filter((book) => book.status === "cho_kiem_duyet"),
    [selected, setSelected] = useState<number | null>(null),
    [reason, setReason] = useState(""),
    [checked, setChecked] = useState(false),
    [error, setError] = useState("");
  if (user?.role !== "admin")
    return (
      <div className="page-container">
        <EmptyState
          title="Khu vực kiểm duyệt của Admin"
          description="Tài khoản người dùng không được xem hàng đợi kiểm duyệt hoặc phân tích của bài khác."
          action={<LinkButton to={{ page: "catalog" }}>Về danh mục</LinkButton>}
          icon="shield"
        />
      </div>
    );
  const book =
    state.auctions.find((item) => item.id === selected) || pending[0];
  return (
    <div className="page-container admin-page">
      <PageHeading
        eyebrow="Không gian quản trị"
        title="Kiểm duyệt bằng thông tin, không bằng cảm tính"
        description="Đối chiếu bản sách, bằng chứng và hai điểm hỗ trợ trước khi ghi quyết định."
      />
      <div className="admin-metrics">
        <Panel>
          <Icon name="file" />
          <div>
            <strong>{pending.length}</strong>
            <span>Bài đang chờ duyệt</span>
          </div>
        </Panel>
        <Panel>
          <Icon name="shield" />
          <div>
            <strong>
              {
                state.complaints.filter((item) => item.status === "cho_xu_ly")
                  .length
              }
            </strong>
            <span>Khiếu nại chưa tiếp nhận</span>
          </div>
          <a href="#/admin-complaints" aria-label="Xem khiếu nại">
            <Icon name="arrow" />
          </a>
        </Panel>
        <Panel>
          <Icon name="book" />
          <div>
            <strong>
              {
                state.auctions.filter(
                  (item) => item.status === "da_qua_kiem_duyet",
                ).length
              }
            </strong>
            <span>Bài đã duyệt, chờ chủ kích hoạt</span>
          </div>
        </Panel>
      </div>
      <div className="moderation-layout">
        <aside className="moderation-queue">
          <div>
            <h2>Hàng đợi</h2>
            <Badge tone="orange">{pending.length} bài</Badge>
          </div>
          {pending.map((item) => (
            <button
              className={book?.id === item.id ? "selected" : ""}
              key={item.id}
              onClick={() => {
                setSelected(item.id);
                setReason("");
                setChecked(false);
                setError("");
              }}
            >
              <img src={item.cover} alt="" />
              <div>
                <strong>{item.title}</strong>
                <span>{userName(item.sellerId)}</span>
                <small>Bài #{item.postId}</small>
              </div>
              <Icon name="chevron" size={16} />
            </button>
          ))}
          {!pending.length && (
            <p>Không còn bài chờ kiểm duyệt trong dữ liệu hiện tại.</p>
          )}
          <div className="queue-note">
            <Icon name="shield" />
            <p>
              Không duyệt tự động theo điểm AI. Cần căn cứ riêng về yếu tố quý
              hiếm.
            </p>
          </div>
        </aside>
        <div>
          {book ? (
            <>
              <Panel className="moderation-book">
                <div className="moderation-book-head">
                  <img
                    src={
                      book.media.find((item) => item.kind === "image")?.url ||
                      book.cover
                    }
                    alt={book.title}
                  />
                  <div>
                    <ListingBadge status={book.status} />
                    <h2>{book.title}</h2>
                    <p>
                      {book.author || "Chưa rõ tác giả"} ·{" "}
                      {book.year ?? "Chưa rõ năm"}
                    </p>
                    <span>
                      Chủ bài: {userName(book.sellerId)} · Bài #{book.postId}
                    </span>
                    <LinkButton
                      to={{ page: "listing", id: book.id }}
                      variant="outline"
                    >
                      Xem hồ sơ và media
                    </LinkButton>
                  </div>
                </div>
                <div className="moderation-prices">
                  <span>
                    Khởi điểm <b>{money(book.startPrice)}</b>
                  </span>
                  <span>
                    Kết thúc sớm (riêng tư){" "}
                    <b>{money(state.privatePrices[book.id])}</b>
                  </span>
                  <span>
                    Bước giá <b>{money(book.step)}</b>
                  </span>
                </div>
                <h3>Yếu tố quý hiếm và căn cứ được cung cấp</h3>
                <p>{book.evidence}</p>
                <h3>Tình trạng được mô tả</h3>
                <p>{book.condition}</p>
              </Panel>
              <Panel className="moderation-ai">
                <AnalysisPanel auction={book} />
              </Panel>
              <Panel className="review-decision">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Quyết định của Admin</p>
                    <h2>Lưu kết quả kiểm duyệt</h2>
                  </div>
                  <Icon name="shield" size={28} />
                </div>
                {book.status === "cho_kiem_duyet" ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const submitter = (event.nativeEvent as SubmitEvent)
                          .submitter as HTMLButtonElement | null,
                        approve = submitter?.value === "approve";
                      if (!reason.trim()) {
                        setError("Cần ghi căn cứ và lý do.");
                        return;
                      }
                      if (approve && !checked) {
                        setError("Cần xác nhận đã đối chiếu yếu tố quý hiếm.");
                        return;
                      }
                      setError("");
                      setSelected(book.id);
                      run(
                        {
                          type: "review",
                          auctionId: book.id,
                          approve,
                          reason,
                          checked,
                        },
                        approve
                          ? "Đã phê duyệt bài. Chủ sách mới là người đặt lịch/kích hoạt."
                          : "Đã lưu căn cứ từ chối để chủ sách bổ sung.",
                      );
                    }}
                  >
                    <label className="field">
                      <span>
                        Căn cứ và lý do kiểm duyệt <b>*</b>
                      </span>
                      <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        required
                        rows={4}
                        maxLength={8000}
                        placeholder="Đã đối chiếu gì? Phần nào cần bổ sung? Vì sao phê duyệt hoặc từ chối?"
                      />
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                      />
                      <span>
                        Tôi đã kiểm tra bằng chứng về yếu tố quý hiếm của đúng
                        bản sách.
                      </span>
                    </label>
                    {error && (
                      <p role="alert" className="field-error">
                        {error}
                      </p>
                    )}
                    <div className="button-row">
                      <Button
                        type="submit"
                        name="decision"
                        value="reject"
                        variant="danger"
                      >
                        Từ chối có lý do
                      </Button>
                      <Button
                        type="submit"
                        name="decision"
                        value="approve"
                        icon="check"
                      >
                        Phê duyệt bài đăng
                      </Button>
                    </div>
                    <p className="field-hint">
                      Phê duyệt chưa kích hoạt phiên. Chủ sách đặt lịch sau bước
                      này.
                    </p>
                  </form>
                ) : (
                  <Notice
                    tone={book.status === "tu_choi" ? "warning" : "success"}
                  >
                    Quyết định đã được lưu.{" "}
                    {book.reviews?.at(-1)?.reason ||
                      "Bài không còn ở hàng chờ kiểm duyệt."}
                  </Notice>
                )}
              </Panel>
            </>
          ) : (
            <EmptyState
              title="Đã xem hết hàng đợi"
              description="Khi có bài mới hoặc được gửi duyệt lại, bạn có thể đối chiếu tại đây."
              icon="check"
            />
          )}
        </div>
      </div>
    </div>
  );
}
export function SystemPage() {
  const { user, state } = useDemo(),
    [probe, setProbe] = useState<"idle" | "queued" | "completed">("idle");
  if (user?.role !== "admin")
    return (
      <div className="page-container">
        <EmptyState
          title="Chẩn đoán dành cho Admin"
          description="Chọn đúng tài khoản quản trị để xem màn hình này."
          icon="shield"
        />
      </div>
    );
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Chẩn đoán phát triển"
        title="Trạng thái hệ thống"
        description="Bố cục trạng thái hạ tầng. Các giá trị bên dưới chỉ được mô phỏng để duyệt giao diện."
      />
      <div className="system-grid">
        {[
          {
            title: "HTTP API",
            description: "Session, phân quyền và nghiệp vụ",
            icon: "file" as const,
          },
          {
            title: "SQL Server",
            description: "20 bảng · 152 cột theo schema hiện tại",
            icon: "book" as const,
          },
          {
            title: "Redis",
            description: "Session, hàng đợi và phối hợp",
            icon: "grid" as const,
          },
          {
            title: "Event Worker",
            description: "Xử lý đặt giá, hết hạn và phân tích",
            icon: "gavel" as const,
          },
        ].map((item) => (
          <Panel key={item.title}>
            <span className="system-icon">
              <Icon name={item.icon} size={26} />
            </span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Badge
              tone={state.connection === "online" ? "green" : "orange"}
              dot
            >
              {state.connection === "online"
                ? "Sẵn sàng · Mẫu"
                : "Chưa xác nhận được kết nối"}
            </Badge>
          </Panel>
        ))}
      </div>
      <Panel className="probe-panel">
        <div>
          <h2>Kiểm tra luồng sự kiện</h2>
          <p>API → Redis Streams → Worker → SQL → Kết quả</p>
          <small>Không dùng probe thay cho kiểm thử nghiệp vụ đấu giá.</small>
        </div>
        <Button
          disabled={probe === "queued" || state.connection === "offline"}
          onClick={() => {
            setProbe("queued");
            window.setTimeout(() => setProbe("completed"), 900);
          }}
        >
          {probe === "queued" ? "Đang kiểm tra mẫu…" : "Chạy probe minh họa"}
        </Button>
        {probe !== "idle" && (
          <Notice tone={probe === "completed" ? "success" : "warning"}>
            {probe === "completed"
              ? "Completed · Luồng mẫu đã hoàn tất. Chưa kiểm tra dịch vụ thật."
              : "Queued · Đang chờ worker mẫu."}
          </Notice>
        )}
      </Panel>
    </div>
  );
}
