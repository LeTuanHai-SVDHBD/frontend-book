/** View models for the isolated design preview. Wire DTOs are documented separately. */
export type Money = string;
export type Viewer = "guest" | "buyer" | "seller" | "admin" | "admin-other";
export interface User {
  id: number;
  name: string;
  initials: string;
  role: "nguoi_dung" | "admin";
  email: string;
}
export type ListingStatus =
  | "cho_kiem_duyet"
  | "tu_choi"
  | "da_qua_kiem_duyet"
  | "da_kich_hoat"
  | "da_ket_thuc";
export interface Media {
  id: string;
  url: string;
  title: string;
  kind: "image" | "video";
  local?: boolean;
  crop?: number;
  poster?: string;
  sampleVideo?: boolean;
}
export interface Bid {
  id: string;
  userId: number;
  amount: Money;
  at: string;
}
export interface Comment {
  id: string;
  userId: number;
  name: string;
  text: string;
  at: string;
}
export interface Auction {
  id: number;
  bookId: number;
  postId: number;
  title: string;
  postTitle: string;
  author: string;
  year: number | null;
  publisher: string;
  genre: string;
  isbn: string;
  sellerId: number;
  cover: string;
  description: string;
  condition: string;
  evidence: string;
  media: Media[];
  startPrice: Money;
  currentPrice: Money | null;
  step: Money;
  cooldown: number;
  startAt: string | null;
  endAt: string | null;
  status: ListingStatus;
  bids: Bid[];
  comments: Comment[];
  rejection?: string;
  reviews?: { at: string; adminId: number; approve: boolean; reason: string }[];
  outcome: {
    winnerId: number | null;
    amount: Money | null;
    reason: "het_thoi_gian" | "dat_gia_toi_thieu";
  } | null;
}
export interface Criterion {
  id: string;
  name: string;
  weight: number;
  score: number | null;
  status: "assessed" | "missing" | "verify" | "not_applicable";
  observation: string;
  evidence: string;
}
export interface Analysis {
  state: "queued" | "running" | "partial" | "completed" | "error" | "off";
  rare: number | null;
  condition: number | null;
  rarity: Criterion[];
  physical: Criterion[];
  warnings: string[];
  at: string;
  model: string;
  version: string;
  history?: {
    at: string;
    state: string;
    rare: number | null;
    condition: number | null;
  }[];
}
export interface Message {
  id: string;
  senderId: number;
  text: string;
  at: string;
  read: boolean;
}
export interface Rating {
  stars: number;
  text: string;
  at: string;
}
export interface Trade {
  id: number;
  code: string;
  auctionId: number;
  buyerId: number;
  sellerId: number;
  amount: Money;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  completedAt: string | null;
  roomOpen: boolean;
  messages: Message[];
  rating: Rating | null;
}
export interface Complaint {
  id: number;
  tradeId: number;
  authorId: number;
  reason: string;
  text: string;
  media: Media[];
  status: "cho_xu_ly" | "dang_xu_ly" | "da_xu_ly";
  adminId: number | null;
  reply: string | null;
  at: string;
  resolvedAt: string | null;
}
export interface Receipt {
  requestId: string;
  auctionId: number;
  userId: number;
  amount: Money;
  state: "dang_cho_xu_ly" | "da_chap_nhan" | "bi_tu_choi";
  reason?: string;
}
export interface ListingDraft {
  title: string;
  postTitle: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  genre: string;
  description: string;
  condition: string;
  evidence: string;
  startPrice: Money;
  earlyPrice: Money;
  step: Money;
  cooldown: number;
  media: Media[];
}
export interface DemoState {
  viewer: Viewer;
  auctions: Auction[];
  privatePrices: Record<number, Money>;
  analyses: Record<number, Analysis>;
  trades: Trade[];
  complaints: Complaint[];
  receipts: Record<string, Receipt>;
  connection: "online" | "offline";
  resultMode: "accept" | "reject" | "delay";
}
export type Route =
  | {
      page:
        | "home"
        | "catalog"
        | "mine"
        | "create"
        | "trades"
        | "complaints"
        | "account"
        | "moderation"
        | "admin-complaints"
        | "system";
    }
  | {
      page: "auction" | "listing" | "edit" | "relist" | "trade" | "complaint";
      id: number;
    };
