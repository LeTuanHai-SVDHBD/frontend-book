import { useEffect, useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { Trade } from "../domain/types";
import { userName } from "../demo/fixtures";
import { date } from "../lib/format";
import { Button, Icon, Notice, Panel } from "./ui";
export default function ChatPanel({
  trade,
  readOnly = false,
}: {
  trade: Trade;
  readOnly?: boolean;
}) {
  const { state, user, run } = useDemo(),
    [text, setText] = useState(""),
    [count, setCount] = useState(50);
  useEffect(() => {
    if (
      state.connection === "online" &&
      user &&
      !readOnly &&
      trade.messages.some(
        (message) => message.senderId !== user.id && !message.read,
      )
    )
      run({ type: "read", tradeId: trade.id });
  }, [trade.messages, trade.id, user?.id, readOnly, state.connection]);
  return (
    <Panel className="chat-panel">
      <header>
        <span className="chat-symbol">
          <Icon name="chat" />
        </span>
        <div>
          <h2>
            {readOnly ? "Trao đổi liên quan · Chỉ đọc" : "Trò chuyện riêng"}
          </h2>
          <p>
            {readOnly
              ? "Chỉ xem khi đang xử lý hồ sơ được giao."
              : "Chỉ người mua và người bán của giao dịch."}
          </p>
        </div>
        <span className="chat-lock">
          <Icon name="shield" size={18} />
        </span>
      </header>
      {trade.messages.length > count && (
        <Button
          small
          variant="ghost"
          onClick={() => setCount((value) => value + 50)}
        >
          Xem tin nhắn cũ hơn
        </Button>
      )}
      <ol className="messages" aria-label="Tin nhắn giao dịch">
        {trade.messages.slice(-count).map((message) => (
          <li
            key={message.id}
            className={
              !readOnly && message.senderId === user?.id ? "mine" : "other"
            }
          >
            <span className="message-author">{userName(message.senderId)}</span>
            <p>{message.text}</p>
            <small>
              {date(message.at)}
              {!readOnly && message.senderId === user?.id
                ? message.read
                  ? " · Đã đọc"
                  : " · Đã gửi"
                : ""}
            </small>
          </li>
        ))}
      </ol>
      {!trade.messages.length && (
        <div className="empty-chat">
          <Icon name="chat" size={35} />
          <p>Bắt đầu cuộc trao đổi về việc nhận sách tại đây.</p>
        </div>
      )}
      {readOnly ? (
        <div className="chat-readonly">
          <Icon name="shield" size={15} />
          Admin không gửi tin nhắn hoặc đánh dấu đọc thay hai bên.
        </div>
      ) : trade.roomOpen ? (
        <form
          className="chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            if (
              run({
                type: "message",
                tradeId: trade.id,
                text,
                id: crypto.randomUUID(),
              })
            )
              setText("");
          }}
        >
          <label className="sr-only" htmlFor={`message-${trade.id}`}>
            Tin nhắn
          </label>
          <textarea
            id={`message-${trade.id}`}
            rows={2}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={4000}
            required
            placeholder="Nhập tin nhắn cho bên còn lại…"
          />
          <Button type="submit" icon="arrow">
            Gửi
          </Button>
          <small>Chỉ hỗ trợ văn bản · Tối đa 4.000 ký tự</small>
        </form>
      ) : (
        <Notice>Cuộc trò chuyện đã đóng. Bạn vẫn được đọc lịch sử.</Notice>
      )}
    </Panel>
  );
}
