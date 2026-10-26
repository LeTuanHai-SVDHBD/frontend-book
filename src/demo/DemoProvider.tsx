import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { DemoState, User } from "../domain/types";
import { createFixtures, users } from "./fixtures";
import { transition, type Command } from "./transition";
import { clearUrls } from "./media";
interface Notice {
  text: string;
  error: boolean;
  id: number;
}
interface Snapshot {
  data: DemoState;
  notice: Notice | null;
}
type Event =
  | { command: Command; at: string; notice?: string }
  | {
      reset: true;
    }
  | { clear: true };
function reducer(snapshot: Snapshot, event: Event): Snapshot {
  if ("clear" in event) return { ...snapshot, notice: null };
  if ("reset" in event)
    return {
      data: createFixtures(),
      notice: {
        text: "Đã khôi phục dữ liệu minh họa.",
        error: false,
        id: Date.now(),
      },
    };
  try {
    const data = transition(snapshot.data, event.command, event.at);
    return {
      data,
      notice: event.notice
        ? { text: event.notice, error: false, id: Date.now() }
        : snapshot.notice,
    };
  } catch (error) {
    return {
      ...snapshot,
      notice: {
        text:
          error instanceof Error
            ? error.message
            : "Chưa thực hiện được thao tác.",
        error: true,
        id: Date.now(),
      },
    };
  }
}
interface DemoContext {
  state: DemoState;
  user: User | null;
  run: (command: Command, notice?: string) => boolean;
  reset: () => void;
}
const Context = createContext<DemoContext | null>(null);
export default function DemoProvider({ children }: { children: ReactNode }) {
  const [snapshot, dispatch] = useReducer(reducer, undefined, () => ({
    data: createFixtures(),
    notice: null,
  }));
  const state = snapshot.data,
    user = state.viewer === "guest" ? null : users[state.viewer];
  const run = (command: Command, notice?: string) => {
    const at = new Date().toISOString();
    try {
      transition(state, command, at);
      dispatch({ command, notice, at });
      return true;
    } catch {
      dispatch({ command, notice, at });
      return false;
    }
  };
  useEffect(() => {
    if (!snapshot.notice) return;
    const timer = setTimeout(() => dispatch({ clear: true }), 5000);
    return () => clearTimeout(timer);
  }, [snapshot.notice]);
  useEffect(() => {
    const pending = Object.values(state.receipts).filter(
      (row) => row.state === "dang_cho_xu_ly",
    );
    if (
      !pending.length ||
      state.connection === "offline" ||
      state.resultMode === "delay"
    )
      return;
    const timer = setTimeout(() => {
      for (const receipt of pending)
        dispatch({
          command: { type: "settle", requestId: receipt.requestId },
          at: new Date().toISOString(),
        });
    }, 850);
    return () => clearTimeout(timer);
  }, [state.receipts, state.connection, state.resultMode]);
  return (
    <Context.Provider
      value={{
        state,
        user,
        run,
        reset: () => {
          clearUrls();
          dispatch({ reset: true });
        },
      }}
    >
      {children}
      {snapshot.notice && (
        <div
          className={`toast ${snapshot.notice.error ? "toast-error" : ""}`}
          role={snapshot.notice.error ? "alert" : "status"}
        >
          <span>{snapshot.notice.error ? "!" : "✓"}</span>
          {snapshot.notice.text}
          <button
            aria-label="Đóng thông báo"
            onClick={() => dispatch({ clear: true })}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw Error("Missing DemoProvider");
  return value;
}
