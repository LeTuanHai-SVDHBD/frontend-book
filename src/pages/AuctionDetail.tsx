import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import {
  canRelist,
  isPublic,
  nextPrice,
  phase,
  bidError,
} from "../domain/rules";
import type { Auction } from "../domain/types";
import { date, duration, money } from "../lib/format";
import useClock from "../lib/useClock";
import {
  Badge,
  Button,
  EmptyState,
  Icon,
  LinkButton,
  Notice,
  Panel,
  Stars,
} from "../components/ui";
import { MoneyField } from "../components/fields";
function BidPanel({ auction, now }: { auction: Auction; now: number }) {
  const { state, user, run } = useDemo(),
    [amount, setAmount] = useState(nextPrice(auction) || ""),
    [requestId, setRequestId] = useState<string | null>(null),
    [error, setError] = useState("");
  const current = phase(auction, now),
    own = user?.id === auction.sellerId,
    receipt = requestId ? state.receipts[requestId] : null;
  const prior = auction.bids.find((bid) => bid.userId === user?.id),
    remaining = prior
      ? Math.max(
          0,
          Math.ceil(
            (Date.parse(prior.at) + auction.cooldown * 1000 - now) / 1000,
          ),
        )
      : 0;
  const eligible =
    !!user && user.role === "nguoi_dung" && !own && current === "live";
  function send() {
    const problem = bidError(auction, user, amount);
    if (problem) {
      setError(problem);
      return;
    }
    if (state.connection === "offline") {
      setError("Đang mất kết nối. Chưa gửi mức giá.");
      return;
    }
    setError("");
    const id = crypto.randomUUID();
    setRequestId(id);
    run({
      type: "bid",
      receipt: {
        requestId: id,
        auctionId: auction.id,
        userId: user!.id,
        amount,
        state: "dang_cho_xu_ly",
      },
    });
  }
  return (
    <Panel className="bid-card">
      <div className="bid-price">
        <span>
          {auction.outcome
            ? "Giá thắng"
            : auction.currentPrice === null
              ? "Giá khởi điểm"
              : "Giá hiện tại"}
        </span>
        <strong>
          {money(
            auction.outcome
              ? auction.outcome.amount
              : auction.currentPrice || auction.startPrice,
          )}
        </strong>
        <small>
          {auction.bids.length} lượt đặt hợp lệ <span>·</span> Bước giá{" "}
          {money(auction.step)}
        </small>
      </div>
      <div className="auction-clock">
        <span>
          <Icon name="clock" size={17} />
          {current === "scheduled"
            ? "Bắt đầu sau"
            : current === "live"
              ? "Thời gian còn lại"
              : current === "closing"
                ? "Đang chờ chốt phiên"
                : "Phiên đã kết thúc"}
        </span>
        {["live", "scheduled"].includes(current) && (
          <strong>
            {duration(
              Date.parse(
                current === "scheduled" ? auction.startAt! : auction.endAt!,
              ) - now,
            )}
          </strong>
        )}
        <small>
          {current === "scheduled" ? "Bắt đầu" : "Kết thúc"}:{" "}
          {date(current === "scheduled" ? auction.startAt : auction.endAt)}
        </small>
      </div>
      {current === "ended" ? (
        <div className="auction-result">
          <Badge tone={auction.outcome?.winnerId ? "green" : "gray"}>
            {auction.outcome?.winnerId
              ? "Phiên có người thắng"
              : "Không có người thắng"}
          </Badge>
          <p>
            {auction.outcome?.winnerId
              ? auction.outcome.winnerId === user?.id
                ? "Bạn là người thắng phiên này."
                : "Kết quả đã được lưu cho người có mức giá hợp lệ cao nhất."
              : "Không có lượt đặt giá hợp lệ. Chỉ chủ sách được đăng lại bản sách này."}
          </p>
          <small>
            {auction.outcome?.reason === "dat_gia_toi_thieu"
              ? "Đạt điều kiện kết thúc sớm."
              : "Kết thúc theo thời gian phiên."}
          </small>
          {state.trades
            .filter(
              (trade) =>
                trade.auctionId === auction.id &&
                [trade.buyerId, trade.sellerId].includes(user?.id || 0),
            )
            .map((trade) => (
              <LinkButton key={trade.id} to={{ page: "trade", id: trade.id }}>
                Mở giao dịch
              </LinkButton>
            ))}
          {own && canRelist(auction) && (
            <LinkButton
              to={{ page: "relist", id: auction.id }}
              variant="outline"
            >
              Đăng lại bản sách
            </LinkButton>
          )}
        </div>
      ) : current === "closing" ? (
        <Notice tone="warning">
          Đã hết giờ. Đang chờ máy chủ xác nhận kết quả; chưa công bố người
          thắng.
        </Notice>
      ) : current === "scheduled" ? (
        <Notice>
          Phiên chưa đến giờ bắt đầu. Bạn có thể xem thông tin và quay lại đúng
          lịch.
        </Notice>
      ) : !user ? (
        <>
          <Notice>Đăng nhập để tham gia phiên đấu giá này.</Notice>
          <LinkButton to={{ page: "account" }}>Đăng nhập để đặt giá</LinkButton>
        </>
      ) : user.role === "admin" ? (
        <Notice>Tài khoản Admin chỉ xem thông tin phiên và kết quả.</Notice>
      ) : own ? (
        <Notice>
          Đây là bản sách của bạn. Bạn chỉ theo dõi phiên và kết quả tại đây.
        </Notice>
      ) : null}
      {eligible && remaining > 0 && (
        <div className="cooldown" role="status">
          <Icon name="clock" />
          <div>
            <strong>Chờ {remaining} giây để đặt tiếp</strong>
            <p>
              Thời gian chờ tính từ mức giá được chấp nhận gần nhất của bạn.
            </p>
          </div>
        </div>
      )}
      {eligible && !receipt && remaining === 0 && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <MoneyField
            label="Mức giá của bạn"
            name="muc_gia"
            value={amount}
            onChange={setAmount}
          />
          <div className="suggested-price">
            <span>Mức tiếp theo từ</span>
            <button
              type="button"
              onClick={() => setAmount(nextPrice(auction) || "")}
            >
              {money(nextPrice(auction))}
            </button>
          </div>
          <Button
            type="submit"
            variant="gold"
            icon="gavel"
            disabled={
              state.connection === "offline" || nextPrice(auction) === null
            }
          >
            Gửi mức giá
          </Button>
          <p className="field-hint">
            Chỉ được chấp nhận sau khi xử lý và lưu thành công. Chờ đặt lại:{" "}
            {auction.cooldown} giây.
          </p>
        </form>
      )}
      {receipt && (
        <div className="bid-receipt" aria-live="polite">
          <span className="eyebrow">Mức giá đã gửi</span>
          <strong>{money(receipt.amount)}</strong>
          <Notice
            tone={
              receipt.state === "da_chap_nhan"
                ? "success"
                : receipt.state === "bi_tu_choi"
                  ? "danger"
                  : "warning"
            }
          >
            {receipt.state === "da_chap_nhan"
              ? "Mức giá đã được chấp nhận."
              : receipt.state === "bi_tu_choi"
                ? `Mức giá bị từ chối: ${receipt.reason}`
                : "Đang chờ xử lý. Chưa xác nhận mức giá thành công."}
          </Notice>
          <small className="receipt-id">
            Mã yêu cầu: {receipt.requestId.slice(0, 8)}…
          </small>
          {receipt.state === "dang_cho_xu_ly" && (
            <Button
              variant="outline"
              onClick={() =>
                run(
                  { type: "bid", receipt },
                  "Thử lại giữ nguyên mã yêu cầu và mức giá, không tạo lượt mới.",
                )
              }
            >
              Thử lại cùng yêu cầu
            </Button>
          )}
          {receipt.state !== "dang_cho_xu_ly" &&
            eligible &&
            remaining === 0 && (
              <Button
                onClick={() => {
                  setRequestId(null);
                  setAmount(nextPrice(auction) || "");
                }}
              >
                Nhập mức giá tiếp theo
              </Button>
            )}
        </div>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="bid-footnote">
        <Icon name="shield" size={16} />
        <span>Lịch sử công khai · Kết quả từ Backend</span>
      </div>
    </Panel>
  );
}
export default function AuctionDetail({ id }: { id: number }) {
  const { state, user, run } = useDemo(),
    now = useClock(),
    [tab, setTab] = useState("description"),
    [mediaIndex, setMediaIndex] = useState(0),
    [comment, setComment] = useState(""),
    [historyCount, setHistoryCount] = useState(5);
  const auction = state.auctions.find(
    (book) => book.id === id && isPublic(book),
  );
  if (!auction)
    return (
      <div className="page-container">
        <EmptyState
          title="Phiên chưa được công bố"
          description="Chỉ bài đã duyệt và kích hoạt mới xuất hiện trong danh mục."
          action={<LinkButton to={{ page: "catalog" }}>Về danh mục</LinkButton>}
        />
      </div>
    );
  const current = phase(auction, now),
    media = [
      {
        id: "cover",
        url: auction.cover,
        title: "Bìa minh họa",
        kind: "image" as const,
      },
      ...auction.media,
    ],
    selected = media[mediaIndex] || media[0];
  const reviews = state.trades.filter(
      (trade) =>
        trade.sellerId === auction.sellerId &&
        trade.completedAt &&
        trade.rating,
    ),
    average = reviews.length
      ? reviews.reduce((sum, trade) => sum + trade.rating!.stars, 0) /
        reviews.length
      : null;
  const canComment = user?.role === "nguoi_dung" && current === "live";
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href="#/catalog">Khám phá</a>
        <span>/</span>
        <span>{auction.genre}</span>
        <span>/</span>
        <b>{auction.title}</b>
      </div>
      {state.connection === "offline" && (
        <Notice tone="warning">
          Kết nối đang gián đoạn. Dữ liệu là lần cập nhật gần nhất; hệ thống sẽ
          lấy lại trạng thái khi kết nối lại.
        </Notice>
      )}
      <div className="auction-layout">
        <div className="auction-book">
          <div className="detail-cover">
            {selected.kind === "video" ? (
              <video src={selected.url} controls />
            ) : (
              <img src={selected.url} alt={selected.title} />
            )}
            <span>
              {selected.title === "Bìa minh họa"
                ? "Bìa minh họa · Không phải ảnh thẩm định"
                : selected.title}
            </span>
          </div>
          {media.length > 1 && (
            <div className="detail-thumbnails">
              {media.map((item, index) => (
                <button
                  aria-label={`Xem ${item.title}`}
                  aria-pressed={mediaIndex === index}
                  key={item.id}
                  onClick={() => setMediaIndex(index)}
                >
                  {item.kind === "image" ? (
                    <img src={item.url} alt="" />
                  ) : (
                    <Icon name="file" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="book-provenance">
            <Icon name="file" size={18} />
            <div>
              <b>Thông tin cần được đối chiếu với bản sách</b>
              <p>
                Ảnh bìa và thông tin trong bản thiết kế là dữ liệu minh họa.
              </p>
            </div>
          </div>
        </div>
        <div className="auction-description">
          <div className="inline-badges">
            <Badge
              tone={
                current === "ended"
                  ? "gray"
                  : current === "scheduled"
                    ? "gold"
                    : "green"
              }
              dot
            >
              {current === "ended"
                ? "Đã kết thúc"
                : current === "scheduled"
                  ? "Sắp diễn ra"
                  : "Đang đấu giá"}
            </Badge>
            <span>Mã phiên #{auction.id}</span>
          </div>
          <h1>{auction.title}</h1>
          <p className="detail-author">{auction.author}</p>
          <dl className="book-facts">
            <div>
              <dt>Năm xuất bản</dt>
              <dd>{auction.year ?? "Chưa cung cấp"}</dd>
            </div>
            <div>
              <dt>Thể loại</dt>
              <dd>{auction.genre}</dd>
            </div>
            <div>
              <dt>Nhà xuất bản</dt>
              <dd>{auction.publisher}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{auction.isbn || "Chưa cung cấp"}</dd>
            </div>
          </dl>
          <h3>Về bản sách này</h3>
          <p>{auction.condition}</p>
          <div className="seller-summary">
            <span className="avatar">
              {auction.sellerId === 1 ? "TN" : "TH"}
            </span>
            <div>
              <b>Uy tín người bán</b>
              <span>
                {average === null
                  ? "Chưa có đánh giá từ giao dịch hoàn tất"
                  : `${average.toFixed(1)}/5 · ${reviews.length} đánh giá`}
              </span>
            </div>
            <button className="text-link" onClick={() => setTab("seller")}>
              Xem nhận xét <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
        <aside className="auction-bid">
          <BidPanel key={id} auction={auction} now={now} />
          <div className="connection-status">
            <i className={state.connection === "offline" ? "offline" : ""} />
            {state.connection === "online"
              ? "Trạng thái đồng bộ · Mô phỏng"
              : "Đang kết nối lại"}
          </div>
        </aside>
      </div>
      <section className="auction-tabs">
        <div className="tabs" role="tablist" aria-label="Thông tin phiên">
          {(
            [
              ["description", "Thông tin bản sách"],
              ["history", "Lịch sử đặt giá"],
              ["comments", `Bình luận (${auction.comments.length})`],
              ["seller", "Uy tín người bán"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              id={`tab-${value}`}
              role="tab"
              aria-controls={`panel-${value}`}
              aria-selected={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <Panel className="detail-tab-panel">
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
          >
            {tab === "description" && (
              <div className="two-column prose">
                <div>
                  <h2>Mô tả và tình trạng</h2>
                  <p>{auction.description}</p>
                  <h3>Tình trạng được người bán mô tả</h3>
                  <p>{auction.condition}</p>
                </div>
                <div className="evidence-note">
                  <h3>Yếu tố quý hiếm và nguồn đối chiếu</h3>
                  <p>{auction.evidence}</p>
                  <Notice>
                    Thông tin do người đăng cung cấp. AI chỉ hỗ trợ Admin kiểm
                    duyệt; báo cáo phân tích không được công khai cho người mua.
                  </Notice>
                </div>
              </div>
            )}
            {tab === "history" && (
              <>
                <div className="section-heading compact">
                  <div>
                    <h2>Lịch sử đặt giá hợp lệ</h2>
                    <p>Chỉ các mức giá đã được chấp nhận và lưu thành công.</p>
                  </div>
                  <Badge tone="green">{auction.bids.length} lượt</Badge>
                </div>
                {auction.bids.length ? (
                  <>
                    <ol className="bid-list">
                      {auction.bids.slice(0, historyCount).map((bid, index) => (
                        <li key={bid.id}>
                          <span
                            className={`bid-rank ${index === 0 ? "first" : ""}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <b>
                              {bid.userId === user?.id
                                ? "Bạn"
                                : `Người tham gia #${bid.userId}`}
                            </b>
                            <time>{date(bid.at)}</time>
                          </div>
                          <strong>{money(bid.amount)}</strong>
                          {index === 0 && <Badge tone="gold">Cao nhất</Badge>}
                        </li>
                      ))}
                    </ol>
                    {historyCount < auction.bids.length && (
                      <Button
                        variant="outline"
                        onClick={() => setHistoryCount((value) => value + 5)}
                      >
                        Xem lượt cũ hơn
                      </Button>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="Chưa có lượt đặt hợp lệ"
                    description="Mức giá đầu tiên có thể bắt đầu từ giá khởi điểm."
                  />
                )}
              </>
            )}
            {tab === "comments" && (
              <div className="comments-layout">
                <div>
                  <h2>Trao đổi công khai về bản sách</h2>
                  {auction.comments.length ? (
                    <ol className="comment-list">
                      {auction.comments.map((item) => (
                        <li key={item.id}>
                          <span className="avatar small-avatar">
                            {item.name.split(" ").slice(-1)[0].slice(0, 2)}
                          </span>
                          <div>
                            <b>{item.name}</b>
                            <time>{date(item.at)}</time>
                            <p>{item.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>
                      Chưa có bình luận. Hãy đặt câu hỏi về bản sách khi phiên
                      đang diễn ra.
                    </p>
                  )}
                </div>
                <div>
                  {canComment ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (
                          run(
                            {
                              type: "comment",
                              auctionId: id,
                              id: crypto.randomUUID(),
                              text: comment,
                            },
                            "Đã thêm bình luận minh họa.",
                          )
                        )
                          setComment("");
                      }}
                    >
                      <label className="field">
                        <span>Bình luận của bạn</span>
                        <textarea
                          name="noi_dung"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          required
                          maxLength={2000}
                          placeholder="Hỏi thêm về tình trạng hoặc ấn bản…"
                          rows={5}
                        />
                      </label>
                      <Button type="submit">Gửi bình luận</Button>
                    </form>
                  ) : (
                    <Notice>
                      {current !== "live"
                        ? "Bình luận chỉ mở trong thời gian phiên diễn ra. Lịch sử vẫn được giữ lại."
                        : user?.role === "admin"
                          ? "Admin chỉ đọc bình luận."
                          : "Đăng nhập để bình luận trong phiên."}
                    </Notice>
                  )}
                </div>
              </div>
            )}
            {tab === "seller" && (
              <>
                <div className="reputation-heading">
                  <div>
                    <h2>Uy tín từ những giao dịch hoàn tất</h2>
                    <p>
                      Chỉ người mua đã xác nhận hoàn tất cùng người bán được
                      đánh giá.
                    </p>
                  </div>
                  <div className="reputation-score">
                    <strong>
                      {average === null ? "—" : average.toFixed(1)}
                      <small>/5</small>
                    </strong>
                    <span>{reviews.length} đánh giá</span>
                  </div>
                </div>
                {reviews.length ? (
                  <div className="review-list">
                    {reviews.map((item) => (
                      <article key={item.id}>
                        <Stars value={item.rating!.stars} />
                        <p>
                          {item.rating!.text ||
                            "Người mua không để lại nhận xét."}
                        </p>
                        <time>{date(item.rating!.at)}</time>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Chưa có đánh giá"
                    description="Đánh giá sẽ xuất hiện sau khi người mua và người bán hoàn tất giao dịch."
                  />
                )}
              </>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
