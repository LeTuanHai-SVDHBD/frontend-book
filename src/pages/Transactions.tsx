import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { participant, canReview } from "../domain/rules";
import { userName } from "../demo/fixtures";
import { date, money } from "../lib/format";
import { href, go } from "../lib/router";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  Icon,
  LinkButton,
  Notice,
  PageHeading,
  Panel,
  Stars,
} from "../components/ui";
import { MediaPicker } from "../components/fields";
import type { Media } from "../domain/types";
import ChatPanel from "../components/ChatPanel";
export default function Transactions() {
  const { state, user } = useDemo(),
    [filter, setFilter] = useState("all");
  const own = state.trades.filter((trade) => participant(trade, user)),
    rows = own.filter(
      (trade) =>
        filter === "all" || (filter === "completed") === !!trade.completedAt,
    );
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Sau mỗi phiên đấu giá"
        title="Giao dịch của bạn"
        description="Trao đổi về bản sách, xác nhận từng bên và giữ lại mọi phản hồi."
      />
      <div className="filter-tabs standalone">
        {[
          ["all", "Tất cả giao dịch"],
          ["pending", "Chờ xác nhận"],
          ["completed", "Đã hoàn tất"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {label}
            {value === "all" && <span>{own.length}</span>}
          </button>
        ))}
      </div>
      {rows.length ? (
        <div className="transaction-list">
          {rows.map((trade) => {
            const book = state.auctions.find(
              (row) => row.id === trade.auctionId,
            )!;
            return (
              <Panel key={trade.id} className="transaction-card">
                <img src={book.cover} alt={`Bìa minh họa ${book.title}`} />
                <div>
                  <div className="inline-badges">
                    <Badge tone={trade.completedAt ? "green" : "orange"}>
                      {trade.completedAt ? "Hoàn tất" : "Chờ hai bên xác nhận"}
                    </Badge>
                    <span>{trade.code}</span>
                  </div>
                  <h2>{book.title}</h2>
                  <p>
                    Bạn là{" "}
                    {trade.buyerId === user?.id ? "người mua" : "người bán"} ·
                    Đối tác:{" "}
                    {userName(
                      trade.buyerId === user?.id
                        ? trade.sellerId
                        : trade.buyerId,
                    )}
                  </p>
                  <div className="confirmation-mini">
                    <span>
                      <Icon
                        name={trade.buyerConfirmedAt ? "check" : "clock"}
                        size={15}
                      />
                      Người mua{" "}
                      {trade.buyerConfirmedAt ? "đã xác nhận" : "chưa xác nhận"}
                    </span>
                    <span>
                      <Icon
                        name={trade.sellerConfirmedAt ? "check" : "clock"}
                        size={15}
                      />
                      Người bán{" "}
                      {trade.sellerConfirmedAt
                        ? "đã xác nhận"
                        : "chưa xác nhận"}
                    </span>
                  </div>
                </div>
                <div className="transaction-price">
                  <span>Giá thắng</span>
                  <strong>{money(trade.amount)}</strong>
                  <LinkButton to={{ page: "trade", id: trade.id }}>
                    Xem giao dịch
                  </LinkButton>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            user?.role === "admin"
              ? "Giao dịch là không gian riêng của hai bên"
              : "Chưa có giao dịch ở mục này"
          }
          description={
            user?.role === "admin"
              ? "Admin chỉ xem chat liên quan khi được giao xử lý khiếu nại."
              : "Giao dịch được tạo sau phiên có người thắng. Bạn có thể tìm một ấn bản phù hợp trước."
          }
          action={
            <LinkButton
              to={{
                page: user?.role === "admin" ? "admin-complaints" : "catalog",
              }}
            >
              {user?.role === "admin"
                ? "Đến khiếu nại"
                : "Khám phá phiên đấu giá"}
            </LinkButton>
          }
          icon="chat"
        />
      )}
    </div>
  );
}
export function TradeDetail({ id }: { id: number }) {
  const { state, user, run } = useDemo(),
    [confirm, setConfirm] = useState(false),
    [complaint, setComplaint] = useState(false),
    [stars, setStars] = useState(5),
    [text, setText] = useState("");
  const trade = state.trades.find((item) => item.id === id);
  if (!trade || !participant(trade, user))
    return (
      <div className="page-container">
        <EmptyState
          title="Không tìm thấy giao dịch của bạn"
          description="Chỉ đúng người mua và người bán mới xem được giao dịch và cuộc trò chuyện này."
          action={<LinkButton to={{ page: "trades" }}>Về giao dịch</LinkButton>}
        />
      </div>
    );
  const book = state.auctions.find((row) => row.id === trade.auctionId)!,
    buyer = user!.id === trade.buyerId,
    confirmed = buyer ? trade.buyerConfirmedAt : trade.sellerConfirmedAt;
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href="#/trades">Giao dịch của tôi</a>
        <span>/</span>
        <b>{trade.code}</b>
      </div>
      <PageHeading
        eyebrow={`Bạn là ${buyer ? "người mua" : "người bán"}`}
        title="Một bản sách, hai sự xác nhận"
        description="Hoàn tất khi cả người mua và người bán xác nhận phần giao dịch của mình."
        actions={
          <Badge tone={trade.completedAt ? "green" : "orange"}>
            {trade.completedAt ? "Giao dịch hoàn tất" : "Chờ hai bên xác nhận"}
          </Badge>
        }
      />
      <div className="trade-layout">
        <aside>
          <Panel className="trade-book">
            <div className="trade-book-head">
              <img src={book.cover} alt={book.title} />
              <div>
                <span className="eyebrow">Bản sách giao dịch</span>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
              </div>
            </div>
            <dl className="summary-list">
              <div>
                <dt>Giá thắng / Số tiền</dt>
                <dd>{money(trade.amount)}</dd>
              </div>
              <div>
                <dt>Người mua</dt>
                <dd>{userName(trade.buyerId)}</dd>
              </div>
              <div>
                <dt>Người bán</dt>
                <dd>{userName(trade.sellerId)}</dd>
              </div>
            </dl>
            <a
              className="text-link"
              href={href({ page: "auction", id: book.id })}
            >
              Xem phiên đã kết thúc <Icon name="arrow" size={16} />
            </a>
            <div className="trace">
              Sách #{book.bookId} → Bài #{book.postId} → Phiên #{book.id} → Giao
              dịch #{trade.id}
            </div>
          </Panel>
          <Panel className="confirm-panel">
            <h2>Xác nhận hoàn tất</h2>
            <ol className="confirmation-list">
              {[
                { label: "Người mua", at: trade.buyerConfirmedAt },
                { label: "Người bán", at: trade.sellerConfirmedAt },
              ].map((item) => (
                <li className={item.at ? "confirmed" : ""} key={item.label}>
                  <span>
                    <Icon name={item.at ? "check" : "clock"} size={17} />
                  </span>
                  <div>
                    <b>{item.label}</b>
                    <small>{item.at ? date(item.at) : "Chưa xác nhận"}</small>
                  </div>
                </li>
              ))}
            </ol>
            {trade.completedAt ? (
              <Notice tone="success">
                Đủ hai xác nhận. Hoàn tất lúc {date(trade.completedAt)}.
              </Notice>
            ) : confirmed ? (
              <Notice>
                Bạn đã xác nhận. Đang chờ bên còn lại hoàn tất phần của họ.
              </Notice>
            ) : (
              <>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(event) => setConfirm(event.target.checked)}
                  />
                  <span>Tôi xác nhận đã hoàn tất phần giao dịch của mình.</span>
                </label>
                <Button
                  disabled={!confirm}
                  variant="gold"
                  onClick={() =>
                    run(
                      { type: "confirm", tradeId: id },
                      "Đã lưu xác nhận của bạn. Chỉ hoàn tất khi đủ hai bên.",
                    )
                  }
                >
                  Xác nhận phần của tôi
                </Button>
              </>
            )}
            <p className="field-hint">
              Hai bên tự thỏa thuận việc nhận sách. Hệ thống không xác nhận
              thanh toán hoặc vận chuyển tự động.
            </p>
          </Panel>
          <Panel className="support-card">
            <Icon name="shield" />
            <h3>Cần đối chiếu thêm?</h3>
            <p>
              Gửi nội dung và ảnh bằng chứng trong đúng giao dịch để Admin xem
              xét.
            </p>
            <Button variant="outline" onClick={() => setComplaint(true)}>
              Gửi khiếu nại
            </Button>
            {state.complaints
              .filter(
                (item) => item.tradeId === id && item.authorId === user!.id,
              )
              .map((item) => (
                <a
                  className="text-link"
                  key={item.id}
                  href={href({ page: "complaint", id: item.id })}
                >
                  Khiếu nại #{item.id}
                  <Icon name="arrow" size={15} />
                </a>
              ))}
          </Panel>
        </aside>
        <div>
          <ChatPanel trade={trade} />
          {buyer && (
            <Panel className="rating-panel">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">Phản hồi của người mua</span>
                  <h2>Đánh giá người bán</h2>
                </div>
                <Icon name="star" size={25} />
              </div>
              {trade.rating ? (
                <>
                  <Badge tone="green">Đã đánh giá</Badge>
                  <Stars value={trade.rating.stars} />
                  <p>{trade.rating.text || "Không có nhận xét."}</p>
                  <small>
                    Đã lưu {date(trade.rating.at)}. Mỗi giao dịch đánh giá một
                    lần.
                  </small>
                </>
              ) : canReview(trade, user) ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    run(
                      { type: "rating", tradeId: id, stars, text },
                      "Đã lưu đánh giá minh họa.",
                    );
                  }}
                >
                  <label>Trải nghiệm với người bán</label>
                  <Stars value={stars} onChange={setStars} />
                  <label className="field">
                    <span>Nhận xét</span>
                    <textarea
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      maxLength={2000}
                      rows={3}
                      placeholder="Mô tả đúng? Trao đổi rõ ràng? Hãy chia sẻ trải nghiệm…"
                    />
                  </label>
                  <p className="field-hint">
                    Số sao và nhận xét sẽ hiển thị công khai trong uy tín người
                    bán.
                  </p>
                  <Button type="submit">Gửi đánh giá</Button>
                </form>
              ) : (
                <Notice>
                  Người mua được đánh giá một lần sau khi cả hai bên xác nhận
                  hoàn tất.
                </Notice>
              )}
            </Panel>
          )}
        </div>
      </div>
      {complaint && (
        <ComplaintForm tradeId={id} onClose={() => setComplaint(false)} />
      )}
    </div>
  );
}
function ComplaintForm({
  tradeId,
  onClose,
}: {
  tradeId: number;
  onClose: () => void;
}) {
  const { state, run } = useDemo(),
    [reason, setReason] = useState(""),
    [text, setText] = useState(""),
    [media, setMedia] = useState<Media[]>([]);
  return (
    <Dialog title="Gửi khiếu nại cho giao dịch" onClose={onClose} wide>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const id =
            Math.max(500, ...state.complaints.map((row) => row.id)) + 1;
          if (
            run(
              { type: "complaint", id, tradeId, reason, text, media },
              "Đã tạo hồ sơ khiếu nại minh họa.",
            )
          ) {
            onClose();
            go({ page: "complaint", id });
          }
        }}
      >
        <Notice>
          Hồ sơ gắn đúng giao dịch và cuộc trò chuyện. Khiếu nại không tự hủy
          giao dịch hoặc đổi kết quả phiên.
        </Notice>
        <label className="field">
          <span>Lý do khiếu nại</span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={300}
            required
            placeholder="Tóm tắt vấn đề cần đối chiếu"
          />
        </label>
        <label className="field">
          <span>Nội dung chi tiết</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={12000}
            rows={5}
            required
            placeholder="Thông tin nào chưa khớp? Căn cứ nào cần Admin xem xét?"
          />
        </label>
        <h3>Ảnh bằng chứng</h3>
        <MediaPicker imagesOnly value={media} onChange={setMedia} />
        <div className="button-row">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Gửi khiếu nại</Button>
        </div>
      </form>
    </Dialog>
  );
}
