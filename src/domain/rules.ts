import { PREVIEW_NOW } from "../lib/useClock";
/** Pure rules used by the demo adapter; these do not replace Backend validation. */
import type { Auction, Money, Trade, User } from "./types.ts";
export const positiveMoney = (value: string) => /^[1-9]\d{0,17}$/.test(value);
export const isPublic = (auction: Auction) =>
  ["da_kich_hoat", "da_ket_thuc"].includes(auction.status);
export function phase(
  auction: Auction,
  now = PREVIEW_NOW,
): "scheduled" | "live" | "closing" | "ended" | "private" {
  if (auction.status === "da_ket_thuc") return "ended";
  if (auction.status !== "da_kich_hoat" || !auction.startAt || !auction.endAt)
    return "private";
  if (now < new Date(auction.startAt).getTime()) return "scheduled";
  return now >= new Date(auction.endAt).getTime() ? "closing" : "live";
}
export function nextPrice(auction: Auction): Money | null {
  const next =
    auction.currentPrice === null
      ? BigInt(auction.startPrice)
      : BigInt(auction.currentPrice) + BigInt(auction.step);
  return next > 999999999999999999n ? null : String(next);
}
export function bidError(
  auction: Auction,
  user: User | null,
  amount: Money,
  now = PREVIEW_NOW,
): string | null {
  if (!user || user.role !== "nguoi_dung")
    return "Đăng nhập tài khoản người dùng để đặt giá.";
  if (user.id === auction.sellerId) return "Chủ sách chỉ xem phiên và kết quả.";
  if (phase(auction, now) !== "live") return "Phiên hiện không nhận mức giá.";
  if (!positiveMoney(amount))
    return "Nhập số tiền nguyên dương, tối đa 18 chữ số.";
  const current =
      auction.currentPrice === null
        ? BigInt(auction.startPrice)
        : BigInt(auction.currentPrice),
    difference = BigInt(amount) - current;
  if (
    difference < 0n ||
    (auction.currentPrice !== null && difference === 0n) ||
    difference % BigInt(auction.step) !== 0n
  )
    return "Mức giá chưa đúng giá hiện tại và bước giá.";
  const prior = auction.bids.find((bid) => bid.userId === user.id);
  if (prior && now - new Date(prior.at).getTime() < auction.cooldown * 1000)
    return "Bạn đang trong thời gian chờ đặt lại.";
  return null;
}
export const participant = (trade: Trade, user: User | null) =>
  !!user &&
  user.role === "nguoi_dung" &&
  [trade.buyerId, trade.sellerId].includes(user.id);
export const canReview = (trade: Trade, user: User | null) =>
  participant(trade, user) &&
  user?.id === trade.buyerId &&
  !!trade.completedAt &&
  !!trade.buyerConfirmedAt &&
  !!trade.sellerConfirmedAt &&
  !trade.rating;
export const canRelist = (auction: Auction) =>
  auction.status === "da_ket_thuc" &&
  auction.outcome !== null &&
  auction.outcome.winnerId === null;
export function validPrices(start: Money, early: Money, step: Money) {
  return (
    positiveMoney(start) &&
    positiveMoney(early) &&
    positiveMoney(step) &&
    BigInt(early) >= BigInt(start)
  );
}
