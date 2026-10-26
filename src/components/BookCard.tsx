import type { Auction } from "../domain/types";
import { phase } from "../domain/rules";
import { money, duration } from "../lib/format";
import { href } from "../lib/router";
import { Badge, Icon } from "./ui";
export default function BookCard({
  auction,
  now,
}: {
  auction: Auction;
  now: number;
}) {
  const current = phase(auction, now),
    ended = current === "ended";
  return (
    <article className="book-card">
      <a
        className={`book-art art-${auction.id % 4}`}
        href={href({ page: "auction", id: auction.id })}
        aria-label={`Xem ${auction.title}`}
      >
        <span className="book-card-status">
          <Badge
            tone={ended ? "gray" : current === "scheduled" ? "gold" : "green"}
            dot
          >
            {ended
              ? "Đã kết thúc"
              : current === "scheduled"
                ? "Sắp diễn ra"
                : "Đang đấu giá"}
          </Badge>
        </span>
        <img
          src={auction.cover}
          alt={`Bìa minh họa ${auction.title}`}
          loading="lazy"
        />
        <span className="book-art-link">
          <Icon name="arrow" size={20} />
        </span>
      </a>
      <div className="book-card-content">
        <p className="book-category">
          {auction.genre} <span>·</span> {auction.year ?? "Chưa rõ năm"}
        </p>
        <a
          href={href({ page: "auction", id: auction.id })}
          className="book-title"
        >
          {auction.title}
        </a>
        <p className="book-author">{auction.author}</p>
        <div className="book-card-price">
          <div>
            <span>
              {ended
                ? "Giá thắng"
                : auction.currentPrice === null
                  ? "Giá khởi điểm"
                  : "Giá hiện tại"}
            </span>
            <strong>
              {money(
                ended
                  ? (auction.outcome?.amount ?? null)
                  : auction.currentPrice || auction.startPrice,
              )}
            </strong>
          </div>
          <span className="bid-count">
            <Icon name="gavel" size={15} />
            {auction.bids.length} lượt
          </span>
        </div>
        <div
          className={`book-card-time ${
            !ended &&
            current === "live" &&
            auction.endAt &&
            Date.parse(auction.endAt) - now < 3600000
              ? "ending-soon"
              : ""
          }`}
        >
          <Icon name="clock" size={15} />
          <span>
            {ended
              ? auction.outcome?.winnerId
                ? "Phiên có người thắng"
                : "Không có người thắng"
              : current === "scheduled"
                ? `Bắt đầu sau ${duration(Date.parse(auction.startAt!) - now)}`
                : `Còn ${duration(Date.parse(auction.endAt!) - now)}`}
          </span>
        </div>
      </div>
    </article>
  );
}
