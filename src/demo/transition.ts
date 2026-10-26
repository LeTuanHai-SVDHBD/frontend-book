/** In-memory preview transitions. No command makes an HTTP request or mutates the main project. */
import type {
  Auction,
  DemoState,
  ListingDraft,
  Media,
  Receipt,
  Viewer,
} from "../domain/types.ts";
import {
  bidError,
  canRelist,
  canReview,
  participant,
  validPrices,
} from "../domain/rules.ts";
import { users } from "./fixtures.ts";
export type Command =
  | { type: "viewer"; value: Viewer }
  | {
      type: "connection";
      value: DemoState["connection"];
    }
  | { type: "mode"; value: DemoState["resultMode"] }
  | {
      type: "bid";
      receipt: Receipt;
    }
  | { type: "settle"; requestId: string }
  | {
      type: "comment";
      auctionId: number;
      text: string;
      id: string;
    }
  | {
      type: "listing";
      id: number;
      sourceId?: number;
      mode: "create" | "edit" | "relist";
      draft: ListingDraft;
    }
  | {
      type: "review";
      auctionId: number;
      approve: boolean;
      reason: string;
      checked: boolean;
    }
  | { type: "activate"; auctionId: number; startAt: string; endAt: string }
  | {
      type: "analysis";
      auctionId: number;
      finish?: boolean;
    }
  | { type: "confirm"; tradeId: number }
  | {
      type: "message";
      tradeId: number;
      text: string;
      id: string;
    }
  | { type: "read"; tradeId: number }
  | {
      type: "rating";
      tradeId: number;
      stars: number;
      text: string;
    }
  | {
      type: "complaint";
      id: number;
      tradeId: number;
      reason: string;
      text: string;
      media: Media[];
    }
  | { type: "claim"; id: number }
  | {
      type: "resolve";
      id: number;
      reply: string;
    }
  | {
      type: "scenario";
      auctionId: number;
      value: "scheduled" | "winner" | "empty";
    };
const ensure = (valid: unknown, message: string) => {
  if (!valid) throw Error(message);
};
export function transition(
  state: DemoState,
  command: Command,
  at: string,
): DemoState {
  const user = state.viewer === "guest" ? null : users[state.viewer],
    now = new Date(at).getTime();
  if (
    state.connection === "offline" &&
    !["viewer", "connection", "mode", "scenario", "settle"].includes(
      command.type,
    )
  )
    throw Error(
      "Đang mất kết nối. Thao tác chưa được lưu; nội dung bạn nhập vẫn được giữ.",
    );
  const auction = (id: number) => {
    const row = state.auctions.find((item) => item.id === id);
    ensure(row, "Không tìm thấy phiên.");
    return row!;
  };
  const trade = (id: number) => {
    const row = state.trades.find((item) => item.id === id);
    ensure(row && participant(row, user), "Bạn không được xem giao dịch này.");
    return row!;
  };
  const updateAuction = (id: number, patch: Partial<Auction>) => ({
    ...state,
    auctions: state.auctions.map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    ),
  });
  const updateTrade = (
    id: number,
    patch: Partial<DemoState["trades"][number]>,
  ) => ({
    ...state,
    trades: state.trades.map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    ),
  });
  switch (command.type) {
    case "viewer":
      return { ...state, viewer: command.value };
    case "connection":
      return { ...state, connection: command.value };
    case "mode":
      return { ...state, resultMode: command.value };
    case "bid": {
      const receipt = command.receipt,
        row = auction(receipt.auctionId);
      ensure(user?.id === receipt.userId, "Vui lòng đăng nhập lại.");
      const existing = state.receipts[receipt.requestId];
      if (existing) {
        ensure(
          existing.amount === receipt.amount &&
            existing.userId === receipt.userId &&
            existing.auctionId === receipt.auctionId,
          "Mã yêu cầu đã có nội dung khác.",
        );
        return state;
      }
      ensure(
        state.connection === "online",
        "Đang mất kết nối. Chưa gửi mức giá.",
      );
      const error = bidError(row, user, receipt.amount, now);
      ensure(!error, error || "");
      return {
        ...state,
        receipts: { ...state.receipts, [receipt.requestId]: receipt },
      };
    }
    case "settle": {
      const receipt = state.receipts[command.requestId];
      if (
        !receipt ||
        receipt.state !== "dang_cho_xu_ly" ||
        state.connection === "offline"
      )
        return state;
      const row = auction(receipt.auctionId),
        actor =
          Object.values(users).find((item) => item.id === receipt.userId) ||
          null;
      const error =
        state.resultMode === "reject"
          ? "Giá đã thay đổi trong lúc xử lý. Hãy kiểm tra mức giá mới nhất."
          : bidError(row, actor, receipt.amount, now);
      const final: Receipt = {
        ...receipt,
        state: error ? "bi_tu_choi" : "da_chap_nhan",
        ...(error ? { reason: error } : {}),
      };
      const next = {
        ...state,
        receipts: { ...state.receipts, [receipt.requestId]: final },
      };
      if (error) return next;
      const bids = [
        {
          id: receipt.requestId,
          userId: receipt.userId,
          amount: receipt.amount,
          at,
        },
        ...row.bids,
      ];
      let updated: Auction = { ...row, currentPrice: receipt.amount, bids };
      let trades = state.trades;
      const early = state.privatePrices[row.id];
      if (early && BigInt(receipt.amount) >= BigInt(early)) {
        updated = {
          ...updated,
          status: "da_ket_thuc",
          outcome: {
            winnerId: receipt.userId,
            amount: receipt.amount,
            reason: "dat_gia_toi_thieu",
          },
        };
        if (!trades.some((item) => item.auctionId === row.id))
          trades = [
            ...trades,
            {
              id: row.id + 1000,
              code: `GD-MH-${row.id}`,
              auctionId: row.id,
              buyerId: receipt.userId,
              sellerId: row.sellerId,
              amount: receipt.amount,
              buyerConfirmedAt: null,
              sellerConfirmedAt: null,
              completedAt: null,
              roomOpen: true,
              messages: [],
              rating: null,
            },
          ];
      }
      return {
        ...next,
        auctions: state.auctions.map((item) =>
          item.id === row.id ? updated : item,
        ),
        trades,
      };
    }
    case "comment": {
      const row = auction(command.auctionId);
      ensure(
        user?.role === "nguoi_dung",
        "Đăng nhập tài khoản người dùng để bình luận.",
      );
      ensure(
        row.status === "da_kich_hoat" &&
          row.startAt &&
          row.endAt &&
          now >= new Date(row.startAt).getTime() &&
          now < new Date(row.endAt).getTime(),
        "Bình luận đã khóa hoặc phiên chưa bắt đầu.",
      );
      ensure(
        command.text.trim() && command.text.length <= 2000,
        "Nhập bình luận từ 1 đến 2.000 ký tự.",
      );
      return updateAuction(row.id, {
        comments: [
          ...row.comments,
          {
            id: command.id,
            userId: user!.id,
            name: user!.name,
            text: command.text.trim(),
            at,
          },
        ],
      });
    }
    case "listing": {
      ensure(user?.role === "nguoi_dung", "Chỉ người dùng được đăng sách.");
      const draft = command.draft;
      ensure(
        validPrices(draft.startPrice, draft.earlyPrice, draft.step),
        "Thông số giá chưa hợp lệ.",
      );
      ensure(
        draft.title.trim() &&
          draft.postTitle.trim() &&
          draft.condition.trim() &&
          draft.evidence.trim(),
        "Cần thông tin sách, tình trạng và bằng chứng.",
      );
      ensure(
        draft.cooldown >= 10 && draft.cooldown <= 30,
        "Chờ đặt lại từ 10 đến 30 giây.",
      );
      const source = command.sourceId ? auction(command.sourceId) : null;
      if (source)
        ensure(source.sellerId === user!.id, "Chỉ chủ sách được thao tác.");
      if (command.mode === "edit")
        ensure(source?.status === "tu_choi", "Chỉ bổ sung bài bị từ chối.");
      if (command.mode === "relist")
        ensure(
          source &&
            canRelist(source) &&
            !state.auctions.some(
              (item) => item.bookId === source.bookId && item.id > source.id,
            ),
          "Chỉ đăng lại phiên cuối kết thúc không có người thắng.",
        );
      const row: Auction = {
        id: command.id,
        postId: command.mode === "edit" ? source!.postId : command.id + 300,
        bookId: source?.bookId || command.id + 200,
        title: source?.title || draft.title,
        postTitle: draft.postTitle,
        author: source?.author || draft.author,
        year: source ? source.year : draft.year ? Number(draft.year) : null,
        publisher: source?.publisher || draft.publisher,
        genre: source?.genre || draft.genre,
        isbn: source?.isbn || draft.isbn,
        sellerId: user!.id,
        cover: source?.cover || "/covers/book-7.svg",
        description: source?.description || draft.description,
        condition: source?.condition || draft.condition,
        evidence: draft.evidence,
        media: draft.media,
        startPrice: draft.startPrice,
        currentPrice: null,
        step: draft.step,
        cooldown: draft.cooldown,
        startAt: null,
        endAt: null,
        status: "cho_kiem_duyet",
        reviews: source?.reviews || [],
        bids: [],
        comments: command.mode === "edit" ? source!.comments : [],
        outcome: null,
      };
      return {
        ...state,
        auctions:
          command.mode === "edit"
            ? state.auctions.map((item) => (item.id === row.id ? row : item))
            : [row, ...state.auctions],
        privatePrices: { ...state.privatePrices, [row.id]: draft.earlyPrice },
        analyses: {
          ...state.analyses,
          [row.id]: {
            state: "queued",
            rare: null,
            condition: null,
            rarity: [],
            physical: [],
            warnings: [],
            at,
            model: "Chưa phân tích",
            version: "book-review-2026-10-v1",
          },
        },
      };
    }
    case "review": {
      const row = auction(command.auctionId);
      ensure(user?.role === "admin", "Chỉ Admin được kiểm duyệt.");
      ensure(row.status === "cho_kiem_duyet", "Bài không còn chờ kiểm duyệt.");
      ensure(command.reason.trim(), "Cần ghi căn cứ kiểm duyệt.");
      ensure(
        !command.approve || command.checked,
        "Cần xác nhận đã kiểm tra bằng chứng quý hiếm.",
      );
      return updateAuction(row.id, {
        status: command.approve ? "da_qua_kiem_duyet" : "tu_choi",
        rejection: command.approve ? undefined : command.reason,
        reviews: [
          ...(row.reviews || []),
          {
            at,
            adminId: user!.id,
            approve: command.approve,
            reason: command.reason,
          },
        ],
      });
    }
    case "activate": {
      const row = auction(command.auctionId);
      ensure(
        row.sellerId === user?.id && row.status === "da_qua_kiem_duyet",
        "Chỉ chủ bài đã duyệt được kích hoạt.",
      );
      ensure(
        Number.isFinite(Date.parse(command.startAt)) &&
          Date.parse(command.startAt) > now &&
          Date.parse(command.endAt) > Date.parse(command.startAt),
        "Giờ bắt đầu phải trong tương lai, kết thúc phải sau bắt đầu.",
      );
      return updateAuction(row.id, {
        status: "da_kich_hoat",
        startAt: command.startAt,
        endAt: command.endAt,
      });
    }
    case "analysis": {
      const row = auction(command.auctionId);
      ensure(user?.role === "admin", "Chỉ Admin yêu cầu phân tích lại.");
      ensure(row.status === "cho_kiem_duyet", "Bài không còn chờ kiểm duyệt.");
      const prior = state.analyses[row.id];
      ensure(prior, "Chưa có đầu vào phân tích mẫu.");
      return {
        ...state,
        analyses: {
          ...state.analyses,
          [row.id]: {
            ...prior,
            state: command.finish ? "partial" : "running",
            at,
            history: command.finish
              ? prior.history
              : [
                  ...(prior.history || []),
                  {
                    at: prior.at,
                    state: prior.state,
                    rare: prior.rare,
                    condition: prior.condition,
                  },
                ],
          },
        },
      };
    }
    case "confirm": {
      const row = trade(command.tradeId),
        buyerConfirmedAt =
          user!.id === row.buyerId
            ? row.buyerConfirmedAt || at
            : row.buyerConfirmedAt,
        sellerConfirmedAt =
          user!.id === row.sellerId
            ? row.sellerConfirmedAt || at
            : row.sellerConfirmedAt;
      return updateTrade(row.id, {
        buyerConfirmedAt,
        sellerConfirmedAt,
        completedAt:
          buyerConfirmedAt && sellerConfirmedAt ? row.completedAt || at : null,
      });
    }
    case "message": {
      const row = trade(command.tradeId);
      ensure(row.roomOpen, "Cuộc trò chuyện đã đóng.");
      ensure(
        command.text.trim() && command.text.length <= 4000,
        "Tin nhắn từ 1 đến 4.000 ký tự.",
      );
      return updateTrade(row.id, {
        messages: [
          ...row.messages,
          {
            id: command.id,
            senderId: user!.id,
            text: command.text.trim(),
            at,
            read: false,
          },
        ],
      });
    }
    case "read": {
      const row = trade(command.tradeId);
      return updateTrade(row.id, {
        messages: row.messages.map((message) =>
          message.senderId === user!.id ? message : { ...message, read: true },
        ),
      });
    }
    case "rating": {
      const row = trade(command.tradeId);
      ensure(
        canReview(row, user),
        "Chỉ người mua đánh giá một lần sau đủ hai xác nhận.",
      );
      ensure(
        Number.isInteger(command.stars) &&
          command.stars >= 1 &&
          command.stars <= 5 &&
          command.text.length <= 2000,
        "Đánh giá chưa hợp lệ.",
      );
      return updateTrade(row.id, {
        rating: { stars: command.stars, text: command.text, at },
      });
    }
    case "complaint": {
      const row = trade(command.tradeId);
      ensure(
        command.reason.trim() &&
          command.reason.length <= 300 &&
          command.text.trim() &&
          command.text.length <= 12000,
        "Cần lý do và nội dung khiếu nại hợp lệ.",
      );
      ensure(
        command.media.length <= 5 &&
          command.media.every((item) => item.kind === "image"),
        "Tối đa 5 ảnh bằng chứng.",
      );
      return {
        ...state,
        complaints: [
          {
            id: command.id,
            tradeId: row.id,
            authorId: user!.id,
            reason: command.reason.trim(),
            text: command.text.trim(),
            media: command.media,
            status: "cho_xu_ly",
            adminId: null,
            reply: null,
            at,
            resolvedAt: null,
          },
          ...state.complaints,
        ],
      };
    }
    case "claim": {
      ensure(user?.role === "admin", "Chỉ Admin được tiếp nhận.");
      const item = state.complaints.find((row) => row.id === command.id);
      ensure(item, "Không tìm thấy hồ sơ.");
      ensure(
        item!.adminId === null || item!.adminId === user!.id,
        "Hồ sơ đã được Admin khác tiếp nhận.",
      );
      return {
        ...state,
        complaints: state.complaints.map((row) =>
          row.id === command.id && row.status === "cho_xu_ly"
            ? { ...row, status: "dang_xu_ly", adminId: user!.id }
            : row,
        ),
      };
    }
    case "resolve": {
      const item = state.complaints.find((row) => row.id === command.id);
      ensure(
        user?.role === "admin" &&
          item?.adminId === user.id &&
          item.status === "dang_xu_ly",
        "Chỉ Admin được phân công, hồ sơ đang xử lý.",
      );
      ensure(
        command.reply.trim() && command.reply.length <= 8000,
        "Cần phản hồi từ 1 đến 8.000 ký tự.",
      );
      return {
        ...state,
        complaints: state.complaints.map((row) =>
          row.id === command.id
            ? {
                ...row,
                status: "da_xu_ly",
                reply: command.reply.trim(),
                resolvedAt: at,
              }
            : row,
        ),
      };
    }
    case "scenario": {
      const row = auction(command.auctionId);
      // Design controls replace one scenario, including its dependent sample data.
      const related = state.trades.filter((item) => item.auctionId === row.id);
      const clean = {
        ...state,
        trades: state.trades.filter((item) => item.auctionId !== row.id),
        complaints: state.complaints.filter(
          (item) => !related.some((trade) => trade.id === item.tradeId),
        ),
        receipts: Object.fromEntries(
          Object.entries(state.receipts).filter(
            ([, receipt]) => receipt.auctionId !== row.id,
          ),
        ),
      };
      if (command.value === "scheduled")
        return {
          ...clean,
          auctions: state.auctions.map((item) =>
            item.id === row.id
              ? {
                  ...row,
                  status: "da_kich_hoat",
                  startAt: new Date(now + 3600000).toISOString(),
                  endAt: new Date(now + 10800000).toISOString(),
                  currentPrice: null,
                  bids: [],
                  comments: [],
                  outcome: null,
                }
              : item,
          ),
        };
      const winner = command.value === "winner",
        amount =
          row.currentPrice === null
            ? row.startPrice
            : String(BigInt(row.currentPrice) + BigInt(row.step));
      const closed: DemoState = {
        ...clean,
        auctions: state.auctions.map((item) =>
          item.id === row.id
            ? {
                ...row,
                status: "da_ket_thuc",
                endAt: at,
                currentPrice: winner ? amount : null,
                bids: winner
                  ? [
                      { id: `scenario-${row.id}`, userId: 2, amount, at },
                      ...row.bids,
                    ]
                  : [],
                outcome: {
                  winnerId: winner ? 2 : null,
                  amount: winner ? amount : null,
                  reason: "het_thoi_gian",
                },
              }
            : item,
        ),
      };
      if (winner && !closed.trades.some((item) => item.auctionId === row.id))
        closed.trades = [
          ...closed.trades,
          {
            id: row.id + 1000,
            code: `GD-MH-${row.id}`,
            auctionId: row.id,
            buyerId: 2,
            sellerId: row.sellerId,
            amount,
            buyerConfirmedAt: null,
            sellerConfirmedAt: null,
            completedAt: null,
            roomOpen: true,
            messages: [],
            rating: null,
          },
        ];
      return closed;
    }
  }
}
