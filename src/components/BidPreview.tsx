import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { Auction } from "../domain/types";
import { canRelist, nextPrice, phase } from "../domain/rules";
import { money, duration } from "../lib/format";
import { MoneyField } from "./fields";
import { Badge, Button, Icon, LinkButton, Notice, Panel } from "./ui";
export default function BidPreview({
  auction,
  now,
}: {
  auction: Auction;
  now: number;
}) {
  const { user, views, setView, explain } = useDemo(),
    [amount, setAmount] = useState(nextPrice(auction) || "");
  const current = phase(auction, now),
    eligible =
      !!user &&
      user.role === "nguoi_dung" &&
      user.id !== auction.sellerId &&
      current === "live";
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
          Giá khởi điểm: {money(auction.startPrice)} · {auction.bids.length}{" "}
          lượt đặt
        </small>
      </div>
      <div className="auction-clock">
        <span>
          <Icon name="clock" />
          {current === "scheduled"
            ? "Phiên bắt đầu sau"
            : current === "ended"
              ? "Phiên đã kết thúc"
              : "Phiên đấu giá kết thúc sau"}
        </span>
        <strong>
          {current === "ended"
            ? "Đã lưu kết quả"
            : duration(
                Date.parse(
                  current === "scheduled" ? auction.startAt! : auction.endAt!,
                ) - now,
              )}
        </strong>
        <small>Thời gian mẫu · Bản thiết kế</small>
      </div>
      {eligible && (
        <>
          <label className="field design-state-select">
            <span>Xem trạng thái đặt giá mẫu</span>
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
                ["cooldown", "Chờ đặt lại"],
              ].map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {views.bid === "ready" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                explain(
                  "Khung xác nhận đặt giá — chỉ là thiết kế. Sau này Backend xử lý và ghi thành công mới hiển thị được chấp nhận.",
                );
              }}
            >
              <MoneyField
                label="Mức giá của bạn"
                name="muc_gia"
                value={amount}
                onChange={setAmount}
              />
              <p>
                Bước giá: <b>{money(auction.step)}</b>
              </p>
              <Button type="submit" variant="gold" icon="gavel">
                Xác nhận đặt giá
              </Button>
            </form>
          )}
          {views.bid === "pending" && (
            <Notice tone="warning">
              <b>Đang chờ xử lý</b>
              <p>Chưa xác nhận đặt giá thành công.</p>
            </Notice>
          )}
          {views.bid === "accepted" && (
            <Notice tone="success">
              <b>Mức giá được chấp nhận</b>
              <p>Ví dụ trạng thái sau khi Backend lưu thành công.</p>
            </Notice>
          )}
          {views.bid === "rejected" && (
            <Notice tone="danger">
              <b>Mức giá bị từ chối</b>
              <p>Ví dụ: giá đã thay đổi. Kiểm tra mức giá mới nhất.</p>
            </Notice>
          )}
          {views.bid === "cooldown" && (
            <Notice>
              <b>Chờ 20 giây để đặt tiếp</b>
              <p>Ẩn ô nhập và nút đặt giá trong thời gian chờ.</p>
            </Notice>
          )}
        </>
      )}
      {!eligible && (
        <Notice>
          {!user
            ? "Đăng nhập để tham gia đấu giá."
            : user.id === auction.sellerId
              ? "Bạn đang xem phiên của mình. Theo dõi giá và kết quả tại đây."
              : user.role === "admin"
                ? "Admin chỉ theo dõi phiên và kết quả."
                : current === "scheduled"
                  ? "Phiên chưa bắt đầu nhận mức giá."
                  : "Phiên không còn nhận mức giá."}
        </Notice>
      )}
      {auction.outcome && (
        <div className="result-summary">
          <Badge tone={auction.outcome.winnerId ? "green" : "gray"}>
            {auction.outcome.winnerId === user?.id
              ? "Bạn đã chiến thắng"
              : auction.outcome.winnerId
                ? "Phiên có người thắng"
                : "Không có người thắng"}
          </Badge>
          <p>
            {auction.outcome.winnerId
              ? "Kết quả đấu giá đã được ghi nhận trong dữ liệu mẫu."
              : "Phiên kết thúc mà không có lượt đặt giá hợp lệ."}
          </p>
          {auction.id === 105 && user && [1, 2].includes(user.id) && (
            <LinkButton variant="gold" to={{ page: "trade", id: 301 }}>
              Xem giao dịch
            </LinkButton>
          )}
          {canRelist(auction) && user?.id === auction.sellerId && (
            <LinkButton
              variant="outline"
              to={{ page: "relist", id: auction.id }}
            >
              Đăng lại bản sách
            </LinkButton>
          )}
        </div>
      )}
      <div className="bid-footnote">
        <Icon name="shield" />
        <span>Một phiên · Một bản sách · Thông tin công khai</span>
      </div>
    </Panel>
  );
}
