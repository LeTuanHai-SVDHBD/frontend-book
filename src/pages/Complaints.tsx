import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { userName } from "../demo/fixtures";
import { date, money } from "../lib/format";
import {
  Badge,
  Button,
  EmptyState,
  Icon,
  LinkButton,
  Notice,
  PageHeading,
  Panel,
} from "../components/ui";
import ChatPanel from "../components/ChatPanel";
const labels = {
  cho_xu_ly: "Chờ xử lý",
  dang_xu_ly: "Đang xử lý",
  da_xu_ly: "Đã xử lý",
};
export default function Complaints() {
  const { state, user } = useDemo(),
    [filter, setFilter] = useState("all"),
    admin = user?.role === "admin";
  const own = state.complaints.filter(
      (item) => admin || item.authorId === user?.id,
    ),
    rows = own.filter((item) => filter === "all" || filter === item.status);
  return (
    <div className="page-container">
      <PageHeading
        eyebrow={admin ? "Không gian quản trị" : "Hồ sơ của bạn"}
        title={admin ? "Xử lý khiếu nại có căn cứ" : "Khiếu nại của tôi"}
        description={
          admin
            ? "Tiếp nhận hồ sơ, đối chiếu đúng cuộc trò chuyện và lưu phản hồi xử lý."
            : "Theo dõi vấn đề đã gửi, bằng chứng và phản hồi từ Admin."
        }
      />
      <div className="filter-tabs standalone">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tất cả <span>{own.length}</span>
        </button>
        {Object.entries(labels).map(([value, label]) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {rows.length ? (
        <div className="case-list">
          {rows.map((item) => {
            const trade = state.trades.find((row) => row.id === item.tradeId)!,
              book = state.auctions.find((row) => row.id === trade.auctionId)!;
            return (
              <Panel className="case-card" key={item.id}>
                <div className="case-icon">
                  <Icon name="file" size={24} />
                </div>
                <div>
                  <div className="inline-badges">
                    <Badge
                      tone={
                        item.status === "da_xu_ly"
                          ? "green"
                          : item.status === "dang_xu_ly"
                            ? "navy"
                            : "orange"
                      }
                    >
                      {labels[item.status]}
                    </Badge>
                    <span>KN-{item.id}</span>
                  </div>
                  <h2>{item.reason}</h2>
                  <p>
                    {book.title} · {trade.code}
                  </p>
                  <small>
                    {date(item.at)}
                    {admin && ` · ${userName(item.authorId)}`}
                    {item.adminId && ` · ${userName(item.adminId)}`}
                  </small>
                </div>
                <LinkButton
                  to={{ page: "complaint", id: item.id }}
                  variant="outline"
                >
                  Xem hồ sơ
                </LinkButton>
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Chưa có khiếu nại ở mục này"
          description={
            admin
              ? "Hồ sơ được gửi từ giao dịch sẽ xuất hiện tại đây."
              : "Bạn có thể gửi khiếu nại từ chi tiết giao dịch khi cần đối chiếu thông tin."
          }
          action={
            !admin ? (
              <LinkButton to={{ page: "trades" }}>Đến giao dịch</LinkButton>
            ) : undefined
          }
          icon="shield"
        />
      )}
    </div>
  );
}
export function ComplaintDetail({ id }: { id: number }) {
  const { state, user, run } = useDemo(),
    [reply, setReply] = useState(""),
    item = state.complaints.find((row) => row.id === id),
    admin = user?.role === "admin";
  if (!item || !user || (!admin && item.authorId !== user.id))
    return (
      <div className="page-container">
        <EmptyState
          title="Không tìm thấy hồ sơ được phép xem"
          description="Chỉ người gửi khiếu nại và Admin được xem hồ sơ này."
          action={
            <LinkButton to={{ page: "complaints" }}>Về khiếu nại</LinkButton>
          }
        />
      </div>
    );
  const trade = state.trades.find((row) => row.id === item.tradeId)!,
    book = state.auctions.find((row) => row.id === trade.auctionId)!,
    assigned = admin && item.adminId === user.id,
    active = assigned && item.status === "dang_xu_ly";
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href={admin ? "#/admin-complaints" : "#/complaints"}>Khiếu nại</a>
        <span>/</span>
        <b>KN-{id}</b>
      </div>
      <PageHeading
        eyebrow={`Hồ sơ KN-${id}`}
        title={item.reason}
        description={`Gửi bởi ${userName(item.authorId)} · ${date(item.at)}`}
        actions={
          <Badge
            tone={
              item.status === "da_xu_ly"
                ? "green"
                : item.status === "dang_xu_ly"
                  ? "navy"
                  : "orange"
            }
          >
            {labels[item.status]}
          </Badge>
        }
      />
      <div className="complaint-detail-layout">
        <div>
          <Panel className="case-detail">
            <h2>Nội dung cần đối chiếu</h2>
            <p className="preserve-lines">{item.text}</p>
            <h3>Ảnh bằng chứng</h3>
            {item.media.length ? (
              <div className="media-grid">
                {item.media.map((image) => (
                  <figure key={image.id}>
                    <a href={image.url} target="_blank" rel="noreferrer">
                      <img src={image.url} alt={image.title} />
                    </a>
                    <figcaption>{image.title}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="muted">
                Người gửi chưa đính kèm ảnh trong hồ sơ này.
              </p>
            )}
            <div className="case-response">
              <span className="eyebrow">Phản hồi xử lý</span>
              {item.reply ? (
                <>
                  <p>{item.reply}</p>
                  <small>
                    {item.adminId && userName(item.adminId)} ·{" "}
                    {date(item.resolvedAt)}
                  </small>
                </>
              ) : (
                <p>
                  {item.adminId
                    ? `${userName(item.adminId)} đang xử lý hồ sơ.`
                    : "Hồ sơ đang chờ Admin tiếp nhận."}
                </p>
              )}
            </div>
          </Panel>
          {active && <ChatPanel trade={trade} readOnly />}
          {admin && !active && (
            <Notice tone="warning">
              {item.status === "da_xu_ly"
                ? "Hồ sơ đã xử lý. Quyền đọc chat qua hồ sơ này đã kết thúc."
                : item.adminId
                  ? "Hồ sơ đã được giao cho Admin khác. Bạn không được xem chat liên quan."
                  : "Tiếp nhận hồ sơ trước khi xem cuộc trò chuyện liên quan."}
            </Notice>
          )}
        </div>
        <aside>
          <Panel className="case-linked">
            <span className="eyebrow">Liên kết giao dịch</span>
            <div className="table-book">
              <img src={book.cover} alt="" />
              <div>
                <b>{book.title}</b>
                <span>{trade.code}</span>
              </div>
            </div>
            <dl className="summary-list">
              <div>
                <dt>Số tiền / Giá thắng</dt>
                <dd>{money(trade.amount)}</dd>
              </div>
              <div>
                <dt>Trạng thái giao dịch</dt>
                <dd>{trade.completedAt ? "Hoàn tất" : "Chờ xác nhận"}</dd>
              </div>
              <div>
                <dt>Phân công</dt>
                <dd>
                  {item.adminId ? userName(item.adminId) : "Chưa tiếp nhận"}
                </dd>
              </div>
            </dl>
            <p className="trace">
              Sách #{book.bookId} → Bài #{book.postId} → Phiên #{book.id} → Giao
              dịch #{trade.id} → KN-{id}
            </p>
          </Panel>
          {admin && item.status === "cho_xu_ly" && item.adminId === null && (
            <Panel className="case-action">
              <h2>Tiếp nhận hồ sơ</h2>
              <p>
                Sau khi tiếp nhận, chỉ bạn được đọc chat để xử lý hồ sơ này. Nội
                dung chat ở chế độ chỉ đọc.
              </p>
              <Button
                icon="shield"
                onClick={() =>
                  run({ type: "claim", id }, "Đã tiếp nhận hồ sơ minh họa.")
                }
              >
                Tiếp nhận khiếu nại
              </Button>
            </Panel>
          )}
          {active && (
            <Panel className="case-action">
              <h2>Lưu phản hồi xử lý</h2>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  run(
                    { type: "resolve", id, reply },
                    "Đã lưu phản hồi. Quyền xem chat qua hồ sơ kết thúc.",
                  );
                }}
              >
                <label className="field">
                  <span>Nội dung phản hồi</span>
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    required
                    maxLength={8000}
                    rows={7}
                    placeholder="Căn cứ đã đối chiếu và kết quả xử lý…"
                  />
                </label>
                <Button type="submit">Hoàn tất xử lý hồ sơ</Button>
              </form>
            </Panel>
          )}
          <Notice>
            Khiếu nại không tự hủy giao dịch, đổi người thắng hoặc thực hiện
            hoàn tiền.
          </Notice>
        </aside>
      </div>
    </div>
  );
}
