import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { Auction, Criterion } from "../domain/types";
import { date } from "../lib/format";
import { Badge, Button, Icon, Notice, Panel } from "./ui";
export default function AnalysisPanel({ auction }: { auction: Auction }) {
  const { state, user, run } = useDemo(),
    [group, setGroup] = useState<"rarity" | "physical">("rarity"),
    analysis = state.analyses[auction.id];
  if (!user || (user.role !== "admin" && user.id !== auction.sellerId))
    return null;
  if (!analysis)
    return (
      <Notice>
        Chưa có lần phân tích cho bài này. Khi bật AI, kết quả được lưu để chủ
        bài và Admin đối chiếu.
      </Notice>
    );
  const labels = {
    queued: "Đang chờ phân tích",
    running: "Đang phân tích",
    partial: "Chưa đầy đủ dữ liệu",
    completed: "Đã phân tích",
    error: "Phân tích thất bại",
    off: "AI đang tắt",
  };
  const criteria = analysis[group];
  return (
    <div className="analysis-panel">
      <div className="section-heading compact">
        <div>
          <h2>AI hỗ trợ kiểm duyệt</h2>
          <p>Hai điểm được tính độc lập. Admin tiếp tục là người quyết định.</p>
        </div>
        <Badge
          tone={
            analysis.state === "error"
              ? "red"
              : analysis.state === "completed"
                ? "green"
                : "orange"
          }
        >
          {labels[analysis.state]}
        </Badge>
      </div>
      <div className="score-cards">
        {[
          {
            title: "Hỗ trợ đánh giá độ hiếm",
            value: analysis.rare,
            subtitle: "4 nhóm tiêu chí · 25% mỗi nhóm",
            icon: "book" as const,
          },
          {
            title: "Tình trạng vật lý",
            value: analysis.condition,
            subtitle: "Bìa, gáy, trang ruột, mép giấy, bìa áo",
            icon: "shield" as const,
          },
        ].map((item) => (
          <Panel key={item.title} className="score-card">
            <div>
              <Icon name={item.icon} />
              <span>{item.title}</span>
            </div>
            <strong>
              {item.value === null ? "—" : item.value}
              <small>/100</small>
            </strong>
            <b>
              {item.value === null
                ? "Chưa đủ dữ liệu để tính điểm"
                : "Điểm hỗ trợ, không phải quyết định duyệt"}
            </b>
            <p>{item.subtitle}</p>
          </Panel>
        ))}
      </div>
      {["queued", "running", "off", "error"].includes(analysis.state) && (
        <Notice tone={analysis.state === "error" ? "danger" : "info"}>
          {analysis.state === "error"
            ? "Không lấy được kết quả phân tích. Lỗi AI không tự từ chối bài."
            : analysis.state === "off"
              ? "Kiểm duyệt thủ công vẫn hoạt động khi AI tắt."
              : "Kết quả sẽ xuất hiện sau xử lý. Không dùng điểm giả thay cho dữ liệu thiếu."}
        </Notice>
      )}
      {analysis.warnings.map((warning) => (
        <Notice key={warning} tone="warning">
          {warning}
        </Notice>
      ))}
      <div
        className="tabs compact-tabs"
        role="tablist"
        aria-label="Nhóm tiêu chí AI"
      >
        <button
          role="tab"
          aria-selected={group === "rarity"}
          onClick={() => setGroup("rarity")}
        >
          Độ hiếm
        </button>
        <button
          role="tab"
          aria-selected={group === "physical"}
          onClick={() => setGroup("physical")}
        >
          Tình trạng vật lý
        </button>
      </div>
      {criteria.length ? (
        <div className="criteria-list">
          {criteria.map((item) => (
            <CriterionRow key={item.id} criterion={item} />
          ))}
        </div>
      ) : (
        <p className="muted">
          Chưa có quan sát đủ điều kiện cho lần phân tích này.
        </p>
      )}
      <Notice>
        <b>Không quan sát được ≠ không tồn tại.</b>
        <p>
          Thiếu tiêu chí áp dụng giữ điểm tổng NULL. Chỉ loại trọng số khi có
          căn cứ “không áp dụng”.
        </p>
      </Notice>
      <div className="analysis-meta">
        <span>
          Phiên bản: <b>{analysis.version}</b>
        </span>
        <span>{analysis.model}</span>
        <span>{date(analysis.at)}</span>
      </div>
      {user.role === "admin" && auction.status === "cho_kiem_duyet" && (
        <Button
          variant="outline"
          icon="file"
          disabled={["queued", "running"].includes(analysis.state)}
          onClick={() => run({ type: "analysis", auctionId: auction.id })}
        >
          Yêu cầu phân tích lại
        </Button>
      )}
      <details className="analysis-history">
        <summary>Lịch sử phân tích và phép tính</summary>
        <p>
          Với từng nhóm: tổng (điểm thành phần × trọng số) / tổng trọng số áp
          dụng. Không cộng hai nhóm thành một điểm.
        </p>
        {[
          ...(analysis.history || []),
          {
            at: analysis.at,
            state: analysis.state,
            rare: analysis.rare,
            condition: analysis.condition,
          },
        ].map((item, index) => (
          <div key={`${item.at}-${index}`}>
            <time>{date(item.at)}</time>
            <span>
              Độ hiếm: {item.rare ?? "NULL"} · Tình trạng:{" "}
              {item.condition ?? "NULL"}
            </span>
            <Badge tone="gray">{item.state}</Badge>
          </div>
        ))}
      </details>
    </div>
  );
}
function CriterionRow({ criterion }: { criterion: Criterion }) {
  const labels = {
    assessed: "Đã đánh giá",
    missing: "Thiếu dữ liệu",
    verify: "Cần xác minh",
    not_applicable: "Không áp dụng",
  };
  return (
    <article>
      <div>
        <h3>{criterion.name}</h3>
        <span>Trọng số {criterion.weight}%</span>
      </div>
      <Badge tone={criterion.status === "assessed" ? "green" : "orange"}>
        {labels[criterion.status]}
      </Badge>
      <strong>
        {criterion.score === null ? "—" : `${criterion.score}/100`}
      </strong>
      <p>{criterion.observation}</p>
      <small>
        <Icon name="image" size={14} />
        {criterion.evidence}
      </small>
    </article>
  );
}
