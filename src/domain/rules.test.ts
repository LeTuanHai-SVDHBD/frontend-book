/** Tests exercise preview behavior, not SQL/Redis/Socket delivery or production authentication. */
import test from "node:test";
import assert from "node:assert/strict";
import { createFixtures as initialFixtures, users } from "../demo/fixtures.ts";
import { transition } from "../demo/transition.ts";
import {
  bidError,
  canRelist,
  canReview,
  nextPrice,
  participant,
  phase,
  positiveMoney,
  validPrices,
} from "./rules.ts";
import type { DemoState, ListingDraft, Receipt } from "./types.ts";
const createFixtures = (): DemoState => ({
  ...initialFixtures(),
  viewer: "buyer",
});
const at = () => new Date().toISOString();
const receipt = (): Receipt => ({
  requestId: "preview-request-1",
  auctionId: 101,
  userId: 2,
  amount: "6250000",
  state: "dang_cho_xu_ly",
});
const draft = (): ListingDraft => ({
  title: "Bản sách mới",
  postTitle: "Giới thiệu bản sách mới",
  author: "Tác giả",
  publisher: "",
  year: "1940",
  isbn: "",
  genre: "Văn học cổ điển",
  condition: "Bìa sờn nhẹ",
  evidence: "Cần đối chiếu trang xuất bản",
  description: "Bản minh họa",
  startPrice: "100000",
  earlyPrice: "500000",
  step: "10000",
  cooldown: 20,
  media: [],
});
test("money remains exact through 18 digits, no floating point conversion", () => {
  assert(positiveMoney("999999999999999999"));
  for (const value of ["0", "01", "1e6", "1.000", "-1", "1000000000000000000"])
    assert(!positiveMoney(value));
  assert(validPrices("999999999999999999", "999999999999999999", "1"));
  assert(!validPrices("200000", "100000", "10000"));
  const row = {
    ...createFixtures().auctions[0],
    currentPrice: "999999999999999999",
    step: "1",
  };
  assert.equal(nextPrice(row), null);
});
test("bid role, ownership, price step and SQL-clock-shaped window match the UI contract", () => {
  const row = createFixtures().auctions[0];
  assert.equal(bidError(row, users.buyer, "6250000"), null);
  assert(bidError(row, users.seller, "6250000"));
  assert(bidError(row, users.admin, "6250000"));
  assert(bidError(row, null, "6250000"));
  assert(bidError(row, users.buyer, "6200001"));
  assert(bidError(row, users.buyer, "6200000"));
  assert.equal(phase(row, Date.parse(row.endAt!)), "closing");
  assert(bidError(row, users.buyer, "6250000", Date.parse(row.endAt!)));
});
test("pending never changes price/history; accepted receipt replays once and cooldown applies", () => {
  let state = createFixtures();
  state = transition(state, { type: "bid", receipt: receipt() }, at());
  assert.equal(state.auctions[0].currentPrice, "6200000");
  assert.equal(state.auctions[0].bids.length, 1);
  state = transition(
    state,
    { type: "settle", requestId: receipt().requestId },
    at(),
  );
  const book = state.auctions[0];
  assert.equal(book.currentPrice, "6250000");
  assert.equal(book.bids.length, 2);
  assert.equal(state.receipts[receipt().requestId].state, "da_chap_nhan");
  assert(bidError(book, users.buyer, "6300000"));
  assert.equal(
    transition(state, { type: "settle", requestId: receipt().requestId }, at()),
    state,
  );
  assert.equal(
    transition(state, { type: "bid", receipt: receipt() }, at()),
    state,
  );
  assert.throws(
    () =>
      transition(
        state,
        { type: "bid", receipt: { ...receipt(), amount: "6300000" } },
        at(),
      ),
    /nội dung khác/,
  );
});
test("rejection and offline handling do not produce successful bids or erase saved history", () => {
  let state = createFixtures();
  state = transition(state, { type: "bid", receipt: receipt() }, at());
  state = transition(state, { type: "connection", value: "offline" }, at());
  assert.equal(
    transition(state, { type: "settle", requestId: receipt().requestId }, at()),
    state,
  );
  assert.throws(
    () =>
      transition(
        state,
        { type: "comment", auctionId: 101, text: "Hello", id: "c" },
        at(),
      ),
    /Chưa|chưa/,
  );
  state = transition(state, { type: "connection", value: "online" }, at());
  state = transition(state, { type: "mode", value: "reject" }, at());
  state = transition(
    state,
    { type: "settle", requestId: receipt().requestId },
    at(),
  );
  assert.equal(state.auctions[0].bids.length, 1);
  assert.equal(state.receipts[receipt().requestId].state, "bi_tu_choi");
});
test("two confirmations are independent, replay timestamps stay fixed, rating is buyer-only once", () => {
  let state = createFixtures();
  const trade = state.trades[0];
  assert(!canReview(trade, users.buyer));
  assert(!participant(trade, users.admin));
  state = transition(
    state,
    { type: "confirm", tradeId: 301 },
    "2026-10-26T01:00:00Z",
  );
  assert.equal(state.trades[0].completedAt, null);
  const first = state.trades[0].buyerConfirmedAt;
  state = transition(
    state,
    { type: "confirm", tradeId: 301 },
    "2026-10-26T02:00:00Z",
  );
  assert.equal(state.trades[0].buyerConfirmedAt, first);
  state = transition(state, { type: "viewer", value: "seller" }, at());
  state = transition(state, { type: "confirm", tradeId: 301 }, at());
  assert(state.trades[0].completedAt);
  assert(!canReview(state.trades[0], users.seller));
  assert.throws(
    () =>
      transition(
        state,
        { type: "rating", tradeId: 301, stars: 5, text: "x" },
        at(),
      ),
    /người mua/,
  );
  state = transition(state, { type: "viewer", value: "buyer" }, at());
  state = transition(
    state,
    { type: "rating", tradeId: 301, stars: 5, text: "Đúng mô tả" },
    at(),
  );
  assert.equal(state.trades[0].rating?.stars, 5);
  assert(!canReview(state.trades[0], users.buyer));
});
test("only assigned Admin handles an active complaint; resolution leaves trade confirmations/result intact", () => {
  let state = createFixtures();
  state = transition(state, { type: "viewer", value: "admin" }, at());
  state = transition(state, { type: "claim", id: 501 }, at());
  const trade = structuredClone(state.trades[0]);
  state = transition(state, { type: "viewer", value: "admin-other" }, at());
  assert.throws(
    () => transition(state, { type: "claim", id: 501 }, at()),
    /khác/,
  );
  assert.throws(
    () => transition(state, { type: "resolve", id: 501, reply: "No" }, at()),
    /phân công/,
  );
  state = transition(state, { type: "viewer", value: "admin" }, at());
  state = transition(
    state,
    { type: "resolve", id: 501, reply: "Đã đối chiếu thông tin." },
    at(),
  );
  assert.equal(state.complaints[0].status, "da_xu_ly");
  assert.deepEqual(state.trades[0], trade);
  assert.throws(() =>
    transition(state, { type: "resolve", id: 501, reply: "Ghi đè" }, at()),
  );
});
test("comments close at end, old messages are text, and only recipient marks messages read", () => {
  let state = createFixtures();
  state = transition(
    state,
    {
      type: "comment",
      auctionId: 101,
      text: "<img src=x onerror=alert(1)>",
      id: "safe-text",
    },
    at(),
  );
  assert.equal(
    state.auctions[0].comments.at(-1)?.text,
    "<img src=x onerror=alert(1)>",
  );
  assert.throws(
    () =>
      transition(
        state,
        { type: "comment", auctionId: 105, text: "Late", id: "late" },
        at(),
      ),
    /khóa/,
  );
  state = transition(
    state,
    { type: "message", tradeId: 301, text: "Tin riêng", id: "new-message" },
    at(),
  );
  state = transition(state, { type: "read", tradeId: 301 }, at());
  assert.equal(state.trades[0].messages.at(-1)?.read, false);
  state = transition(state, { type: "viewer", value: "seller" }, at());
  state = transition(state, { type: "read", tradeId: 301 }, at());
  assert.equal(state.trades[0].messages.at(-1)?.read, true);
});
test("pending posts cannot activate; approved owner can schedule, resubmit/relist preserve book and history", () => {
  let state = createFixtures();
  state = transition(state, { type: "viewer", value: "seller" }, at());
  assert.throws(() =>
    transition(
      state,
      {
        type: "activate",
        auctionId: 107,
        startAt: new Date(Date.now() + 3600000).toISOString(),
        endAt: new Date(Date.now() + 7200000).toISOString(),
      },
      at(),
    ),
  );
  state = transition(
    state,
    {
      type: "activate",
      auctionId: 109,
      startAt: new Date(Date.now() + 3600000).toISOString(),
      endAt: new Date(Date.now() + 7200000).toISOString(),
    },
    at(),
  );
  assert.equal(
    phase(state.auctions.find((row) => row.id === 109)!),
    "scheduled",
  );
  const empty = state.auctions.find((row) => row.id === 106)!;
  assert(canRelist(empty));
  assert(!canRelist(state.auctions.find((row) => row.id === 105)!));
  state = transition(
    state,
    { type: "listing", id: 111, sourceId: 106, mode: "relist", draft: draft() },
    at(),
  );
  assert.equal(state.auctions[0].bookId, empty.bookId);
  assert.equal(state.auctions[0].status, "cho_kiem_duyet");
  assert.throws(
    () =>
      transition(
        state,
        {
          type: "listing",
          id: 112,
          sourceId: 106,
          mode: "relist",
          draft: draft(),
        },
        at(),
      ),
    /phiên cuối/,
  );
});
test("moderation requires a reason and rarity confirmation; AI NULL never prevents manual decision", () => {
  let state = createFixtures();
  state = transition(state, { type: "viewer", value: "admin" }, at());
  assert.equal(state.analyses[107].rare, 75);
  assert.equal(state.analyses[107].condition, null);
  assert.throws(
    () =>
      transition(
        state,
        {
          type: "review",
          auctionId: 107,
          approve: true,
          reason: "Đã xem",
          checked: false,
        },
        at(),
      ),
    /xác nhận/,
  );
  state = transition(
    state,
    {
      type: "review",
      auctionId: 107,
      approve: true,
      reason: "Đã đối chiếu nguồn và bản sách.",
      checked: true,
    },
    at(),
  );
  assert.equal(
    state.auctions.find((book) => book.id === 107)?.status,
    "da_qua_kiem_duyet",
  );
  assert.equal(state.analyses[107].condition, null);
});

test("switching a design scenario keeps result, bids and linked sample trade consistent", () => {
  let state = createFixtures();
  state = transition(
    state,
    { type: "scenario", auctionId: 101, value: "winner" },
    at(),
  );
  const won = state.auctions.find((row) => row.id === 101)!;
  const trade = state.trades.find((row) => row.auctionId === 101)!;
  assert.equal(trade.amount, won.outcome?.amount);
  assert.equal(trade.amount, won.bids[0].amount);
  state = transition(
    state,
    { type: "scenario", auctionId: 101, value: "empty" },
    at(),
  );
  assert.equal(state.trades.filter((row) => row.auctionId === 101).length, 0);
  assert.equal(state.auctions.find((row) => row.id === 101)?.bids.length, 0);
  state = transition(
    state,
    { type: "scenario", auctionId: 101, value: "scheduled" },
    at(),
  );
  const scheduled = state.auctions.find((row) => row.id === 101)!;
  assert.equal(phase(scheduled), "scheduled");
  assert.equal(scheduled.outcome, null);
  assert.equal(scheduled.currentPrice, null);
});

test("new listing leaves an unknown publication year empty rather than inventing a year", () => {
  let state = createFixtures();
  state = transition(state, { type: "viewer", value: "seller" }, at());
  state = transition(
    state,
    {
      type: "listing",
      id: 111,
      mode: "create",
      draft: { ...draft(), year: "" },
    },
    at(),
  );
  assert.equal(state.auctions[0].year, null);
});
