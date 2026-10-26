/** Production API contracts read from feat/Hai @ b8f27a5. Not connected by this preview. */
export type DecimalMoney = string;
export type RowVersion = string;
export interface Page<T> {
  items: T[];
  nextBefore: number | null;
}
export interface BidRequest {
  ma_yeu_cau: string;
  muc_gia: DecimalMoney;
}
export interface BidDecision {
  ma_yeu_cau: string;
  phien_dau_gia_id: number;
  muc_gia: DecimalMoney;
  trang_thai: "dang_cho_xu_ly" | "da_chap_nhan" | "bi_tu_choi";
  ly_do: string | null;
  thoi_gian_xu_ly: string | null;
}
export interface AuctionPrices {
  gia_khoi_diem: DecimalMoney;
  gia_toi_thieu: DecimalMoney;
  buoc_gia: DecimalMoney;
  thoi_gian_cho_dat_lai: number;
}
export interface UploadReference {
  upload_id: string;
  tieu_de: string | null;
}
export interface BookInput {
  ten_sach: string;
  tac_gia: string | null;
  the_loai: string | null;
  nha_xuat_ban: string | null;
  nam_xuat_ban: number | null;
  isbn: string | null;
  tinh_trang_sach: string;
  mo_ta: string | null;
}
export interface PostContent {
  tieu_de: string;
  mo_ta_tinh_trang: string;
}
export interface NewPostRequest {
  ma_yeu_cau: string;
  sach: BookInput;
  bai_dang: PostContent;
  phien: AuctionPrices;
  media: UploadReference[];
}
export interface ResubmitPostRequest {
  row_version: RowVersion;
  bai_dang: PostContent;
  phien: AuctionPrices;
  media: UploadReference[];
  reuse_media: boolean;
}
export interface RelistPostRequest {
  ma_yeu_cau: string;
  bai_dang: PostContent;
  phien: AuctionPrices;
  media: UploadReference[];
  reuse_media: boolean;
}
export interface ModerationRequest {
  quyet_dinh: "phe_duyet" | "tu_choi";
  ly_do: string;
  xac_nhan_quy_hiem: boolean;
  row_version: RowVersion;
}
export interface ActivateRequest {
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
  row_version: RowVersion;
}
export interface ComplaintRequest {
  ly_do: string;
  noi_dung: string;
  media: UploadReference[];
}
export interface RatingRequest {
  so_sao: number;
  noi_dung: string | null;
}
export interface PublicBidDTO {
  luot_dat_gia_id: number;
  nguoi_dung_id: number;
  muc_gia: DecimalMoney;
  thoi_gian_dat: string;
}
export interface PublicAuctionDTO {
  bai_dang_id: number;
  phien_dau_gia_id: number;
  gia_khoi_diem: DecimalMoney;
  gia_hien_tai: DecimalMoney | null;
  buoc_gia: DecimalMoney;
  thoi_gian_cho_dat_lai: number;
  trang_thai: "da_kich_hoat" | "da_ket_thuc";
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
  server_time: string;
  lich_su: PublicBidDTO[];
  lich_su_truoc: number | null;
  ket_qua: {
    trang_thai: "co_nguoi_thang" | "khong_co_nguoi_thang";
    nguoi_thang_dau_id: number | null;
    muc_gia_thang: DecimalMoney | null;
    thoi_gian_ket_thuc: string;
    ly_do_ket_thuc: "het_thoi_gian" | "dat_gia_toi_thieu" | null;
  } | null;
}
export interface BidAvailabilityDTO {
  la_chu_sach: boolean;
  duoc_dat_lai_luc: string | null;
  server_time: string;
}
/** Endpoint names only, no base URL, credential, fetch, Socket or production integration. */
export const endpoints = {
  catalog: "/api/posts/catalog",
  mine: "/api/posts/mine",
  pending: "/api/posts/pending",
  posts: "/api/posts",
  mediaConfig: "/api/media/config",
  auth: "/api/auth",
  auction: (id: number) => `/api/auctions/${id}`,
  ai: (postId: number) => `/api/ai/${postId}`,
  trades: "/api/community/trades",
  complaints: "/api/community/complaints",
  comments: (id: number) => `/api/community/auctions/${id}/comments`,
  reputation: (id: number) => `/api/community/auctions/${id}/reputation`,
} as const;
