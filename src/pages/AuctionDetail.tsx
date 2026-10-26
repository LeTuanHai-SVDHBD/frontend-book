import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { isPublic, phase } from "../domain/rules";
import { date, money } from "../lib/format";
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
import BidPanel from "../components/BidPreview";
import BookMedia, { BookPhoto } from "../components/BookMedia";
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
    media = auction.media.length
      ? auction.media
      : [
          {
            id: "cover",
            url: auction.cover,
            title: "Bìa minh họa",
            kind: "image" as const,
          },
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
            <BookMedia media={selected} />
            <span>
              {selected.title === "Bìa minh họa"
                ? "Bìa minh họa · Không phải ảnh thẩm định"
                : selected.title}
            </span>
          </div>
          <div className="single-book-label">
            <Badge tone="navy">01 bản sách</Badge>
            <span>
              {media.filter((item) => item.kind === "image").length} ảnh ·{" "}
              {media.filter((item) => item.kind === "video").length} video
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
                  <BookPhoto media={item} alt={item.title} />
                  {item.kind === "video" && (
                    <span className="thumbnail-play">
                      <Icon name="play" size={28} />
                    </span>
                  )}
                  <b>{item.kind === "video" ? "Video" : item.title}</b>
                </button>
              ))}
            </div>
          )}
          <div className="book-provenance">
            <Icon name="file" size={18} />
            <div>
              <b>Thông tin cần được đối chiếu với bản sách</b>
              <p>
                Cùng một bản sách qua nhiều góc nhìn. Ảnh được tạo để minh họa
                thiết kế, không phải ảnh thẩm định thật.
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
          <aside className="auction-bid">
            <BidPanel key={id} auction={auction} now={now} />
            <div className="connection-status">
              <i className={state.connection === "offline" ? "offline" : ""} />
              {state.connection === "online"
                ? "Dữ liệu mẫu · Không có kết nối nghiệp vụ"
                : "Đang kết nối lại"}
            </div>
          </aside>
        </div>
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
