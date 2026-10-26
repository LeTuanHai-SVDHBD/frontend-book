/** Static presentation data. Only view controls change; business buttons never write data. */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { DemoState, User } from "../domain/types";
import type { Command } from "./commands";
import { createFixtures, users } from "./fixtures";
export type BidView =
  | "ready"
  | "pending"
  | "accepted"
  | "rejected"
  | "cooldown";
export type TradeView =
  | "waiting"
  | "buyer-confirmed"
  | "completed"
  | "reviewed";
export type ComplaintView = "waiting" | "assigned" | "resolved";
export type AiView = "partial" | "queued" | "error" | "off";
interface Views {
  bid: BidView;
  trade: TradeView;
  complaint: ComplaintView;
  ai: AiView;
}
interface DemoContext {
  state: DemoState;
  user: User | null;
  views: Views;
  setView: <K extends keyof Views>(key: K, value: Views[K]) => void;
  run: (command: Command, notice?: string) => boolean;
  reset: () => void;
  explain: (text?: string) => void;
}
const Context = createContext<DemoContext | null>(null);
const initialViews: Views = {
  bid: "ready",
  trade: "waiting",
  complaint: "waiting",
  ai: "partial",
};
export default function DemoProvider({ children }: { children: ReactNode }) {
  const [base, setBase] = useState(createFixtures),
    [views, setViews] = useState<Views>(initialViews),
    [note, setNote] = useState("");
  const state: DemoState = {
    ...base,
    trades: base.trades.map((trade) => ({
      ...trade,
      buyerConfirmedAt:
        views.trade === "waiting" ? null : "2026-10-26T02:00:00Z",
      sellerConfirmedAt: ["completed", "reviewed"].includes(views.trade)
        ? "2026-10-26T02:05:00Z"
        : null,
      completedAt: ["completed", "reviewed"].includes(views.trade)
        ? "2026-10-26T02:05:00Z"
        : null,
      rating:
        views.trade === "reviewed"
          ? {
              stars: 5,
              text: "Bản sách đúng mô tả, người bán trao đổi rõ ràng.",
              at: "2026-10-26T02:10:00Z",
            }
          : null,
    })),
    complaints: base.complaints.map((item) => ({
      ...item,
      status:
        views.complaint === "waiting"
          ? "cho_xu_ly"
          : views.complaint === "assigned"
            ? "dang_xu_ly"
            : "da_xu_ly",
      adminId: views.complaint === "waiting" ? null : 4,
      reply:
        views.complaint === "resolved"
          ? "Đã đối chiếu mô tả, ảnh và trao đổi trong giao dịch. Đây là nội dung phản hồi mẫu."
          : null,
      resolvedAt:
        views.complaint === "resolved" ? "2026-10-26T02:20:00Z" : null,
    })),
    analyses: Object.fromEntries(
      Object.entries(base.analyses).map(([id, a]) => [
        id,
        { ...a, state: views.ai },
      ]),
    ),
  };
  const user = state.viewer === "guest" ? null : users[state.viewer];
  const explain = (text = "") =>
    setNote(
      text ||
        "Đây là nút trong bản thiết kế. Chức năng sẽ được kết nối ở dự án chính sau khi duyệt giao diện. Dữ liệu mẫu không thay đổi.",
    );
  function run(command: Command): boolean {
    if (command.type === "read") return false;
    if (command.type === "viewer") {
      setBase((previous) => ({ ...previous, viewer: command.value }));
      return true;
    }
    if (command.type === "connection") {
      setBase((previous) => ({ ...previous, connection: command.value }));
      return true;
    }
    if (command.type === "mode") {
      setViews((previous) => ({
        ...previous,
        bid:
          command.value === "delay"
            ? "pending"
            : command.value === "reject"
              ? "rejected"
              : "ready",
      }));
      return true;
    }
    explain();
    return false;
  }
  return (
    <Context.Provider
      value={{
        state,
        user,
        views,
        setView: (key, value) =>
          setViews((previous) => ({ ...previous, [key]: value })),
        run,
        explain,
        reset: () => {
          setBase(createFixtures());
          setViews(initialViews);
          setNote("");
        },
      }}
    >
      {children}
      {note && (
        <div className="toast design-note" role="status">
          <span>i</span>
          <div>
            <b>Ghi chú thiết kế</b>
            <p>{note}</p>
          </div>
          <button aria-label="Đóng thông báo" onClick={() => setNote("")}>
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw Error("Missing design provider");
  return value;
}
