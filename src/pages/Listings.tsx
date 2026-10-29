import BookMedia, { BookPhoto } from "../components/BookMedia";
import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { canRelist, isPublic } from "../domain/rules";
import { date, money } from "../lib/format";
import { href } from "../lib/router";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  Icon,
  LinkButton,
  ListingBadge,
  Notice,
  PageHeading,
  Panel,
  listingLabels,
} from "../components/ui";
import AnalysisPanel from "../components/AnalysisPanel";
export default function Listings() {
  const { state, user } = useDemo(),
    [filter, setFilter] = useState("all");
  if (!user || user.role !== "nguoi_dung")
    return (
      <div className="page-container">
        <EmptyState
          title="Không gian dành cho chủ sách"
          description="Đăng nhập tài khoản người dùng để quản lý bài đăng của mình."
          action={
            <LinkButton to={{ page: "account" }}>Đến tài khoản</LinkButton>
          }
        />
      </div>
    );
  const own = state.auctions.filter((book) => book.sellerId === user.id),
    rows = own.filter((book) => filter === "all" || book.status === filter);
  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Không gian của bạn"
        title="Những bản sách bạn gửi gắm"
        description="Theo dõi kiểm duyệt, chuẩn bị phiên đấu giá và giữ lại lịch sử của từng bản sách."
        actions={
          <LinkButton to={{ page: "create" }} icon="plus">
            Đăng sách mới
          </LinkButton>
        }
      />
      <div className="stat-row">
        {[
          { label: "Bài của bạn", value: own.length, icon: "book" as const },
          {
            label: "Chờ kiểm duyệt",
            value: own.filter((book) => book.status === "cho_kiem_duyet")
              .length,
            icon: "file" as const,
          },
          {
            label: "Chờ kích hoạt",
            value: own.filter((book) => book.status === "da_qua_kiem_duyet")
              .length,
            icon: "clock" as const,
          },
          {
            label: "Đã kích hoạt",
            value: own.filter((book) => book.status === "da_kich_hoat").length,
            icon: "gavel" as const,
          },
        ].map((item) => (
          <Panel key={item.label}>
            <span>
              <Icon name={item.icon} />
              {item.label}
            </span>
            <strong>{String(item.value).padStart(2, "0")}</strong>
          </Panel>
        ))}
      </div>
      <div className="table-toolbar">
        <div className="filter-tabs" role="group" aria-label="Lọc bài của tôi">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          {(
            [
              "cho_kiem_duyet",
              "da_qua_kiem_duyet",
              "tu_choi",
              "da_kich_hoat",
              "da_ket_thuc",
            ] as const
          ).map((value) => (
            <button
              className={filter === value ? "active" : ""}
              key={value}
              onClick={() => setFilter(value)}
            >
              {listingLabels[value]}
            </button>
          ))}
        </div>
      </div>
      {rows.length ? (
        <Panel className="table-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Bản sách</th>
                  <th>Giá khởi điểm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác tiếp theo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <a
                        className="table-book"
                        href={href({ page: "listing", id: book.id })}
                      >
                        <img src={book.cover} alt="" />
                        <div>
                          <b>{book.title}</b>
                          <span>
                            {book.author} · #{book.postId}
                          </span>
                          {book.rejection && (
                            <small className="rejection-line">
                              {book.rejection}
                            </small>
                          )}
                        </div>
                      </a>
                    </td>
                    <td>
                      <strong>{money(book.startPrice)}</strong>
                      <small className="cell-hint">
                        Bước {money(book.step)}
                      </small>
                    </td>
                    <td>
                      <ListingBadge status={book.status} />
                      <small className="cell-hint">
                        {book.startAt ? date(book.startAt) : "Chưa đặt lịch"}
                      </small>
                    </td>
                    <td>
                      <a
                        className="table-link"
                        href={href({ page: "listing", id: book.id })}
                      >
                        {book.status === "da_qua_kiem_duyet"
                          ? "Đặt lịch & kích hoạt"
                          : book.status === "tu_choi"
                            ? "Bổ sung và gửi duyệt lại"
                            : "Xem chi tiết"}
                        <Icon name="arrow" size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <EmptyState
          title="Chưa có bài ở trạng thái này"
          description={
            own.length
              ? "Thử chọn trạng thái khác để xem các bản sách."
              : "Bạn có thể bắt đầu bằng một bản sách và những bằng chứng rõ ràng."
          }
          action={
            <LinkButton to={{ page: "create" }}>Đăng sách đầu tiên</LinkButton>
          }
        />
      )}
      <Notice>
        Chỉ kích hoạt bài đã duyệt. Đăng lại khi phiên cuối kết thúc không có
        người thắng; giữ nguyên bản sách và lịch sử.
      </Notice>
    </div>
  );
}
export function ListingDetail({ id }: { id: number }) {
  const { state, user } = useDemo(),
    [activate, setActivate] = useState(false),
    [tab, setTab] = useState("info");
  const book = state.auctions.find((item) => item.id === id);
  if (!book || !user || (user.role !== "admin" && book.sellerId !== user.id))
    return (
      <div className="page-container">
        <EmptyState
          title="Không tìm thấy bài bạn được phép xem"
          description="Thông tin kiểm duyệt và giá kết thúc sớm chỉ dành cho chủ bài hoặc Admin."
          action={<LinkButton to={{ page: "mine" }}>Về bài của tôi</LinkButton>}
        />
      </div>
    );
  const own = user.id === book.sellerId,
    latest = !state.auctions.some(
      (item) => item.bookId === book.bookId && item.id > book.id,
    );
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href={user.role === "admin" ? "#/moderation" : "#/mine"}>
          {user.role === "admin" ? "Kiểm duyệt" : "Bài của tôi"}
        </a>
        <span>/</span>
        <b>Bài #{book.postId}</b>
      </div>
      <PageHeading
        title={book.title}
        description={`Sách #${book.bookId} → Bài #${book.postId} → Phiên #${book.id}`}
        actions={
          <>
            <ListingBadge status={book.status} />
            {isPublic(book) && (
              <LinkButton
                to={{ page: "auction", id: book.id }}
                variant="outline"
              >
                Xem phiên công khai
              </LinkButton>
            )}
          </>
        }
      />
      {book.rejection && (
        <Notice tone="danger">
          <b>Căn cứ từ chối</b>
          <p>{book.rejection}</p>
        </Notice>
      )}
      <div className="private-listing-layout">
        <Panel className="listing-summary">
          <BookPhoto
            className="listing-cover"
            media={
              book.media.find((item) => item.kind === "image") || {
                id: "cover",
                url: book.cover,
                title: book.title,
                kind: "image",
              }
            }
          />

          <h2>Thông số riêng của bài</h2>
          <dl className="summary-list">
            <div>
              <dt>Giá khởi điểm</dt>
              <dd>{money(book.startPrice)}</dd>
            </div>
            <div>
              <dt>Giá kết thúc sớm</dt>
              <dd>{money(state.privatePrices[id])}</dd>
            </div>
            <div>
              <dt>Bước giá</dt>
              <dd>{money(book.step)}</dd>
            </div>
            <div>
              <dt>Chờ đặt lại</dt>
              <dd>{book.cooldown} giây</dd>
            </div>
            <div>
              <dt>Bắt đầu</dt>
              <dd>
                {book.startAt ? date(book.startAt) : "Đặt sau khi được duyệt"}
              </dd>
            </div>
            <div>
              <dt>Kết thúc</dt>
              <dd>
                {book.endAt && book.startAt
                  ? date(book.endAt)
                  : "Đặt sau khi được duyệt"}
              </dd>
            </div>
          </dl>
          <small className="private-label">
            <Icon name="shield" size={15} />
            Chỉ chủ bài và Admin xem giá kết thúc sớm
          </small>
          {own && book.status === "da_qua_kiem_duyet" && (
            <Button
              variant="gold"
              icon="clock"
              onClick={() => setActivate(true)}
            >
              Đặt lịch & kích hoạt
            </Button>
          )}
          {own && book.status === "tu_choi" && (
            <LinkButton to={{ page: "edit", id }}>
              Bổ sung và gửi duyệt lại
            </LinkButton>
          )}
          {own && latest && canRelist(book) && (
            <LinkButton to={{ page: "relist", id }} variant="outline">
              Đăng lại cùng bản sách
            </LinkButton>
          )}
        </Panel>
        <div>
          <div className="tabs" role="tablist" aria-label="Chi tiết bài riêng">
            {[
              ["info", "Thông tin bài"],
              ["ai", "Phân tích AI"],
              ["history", "Lịch sử kiểm duyệt"],
            ].map(([value, label]) => (
              <button
                role="tab"
                aria-selected={tab === value}
                key={value}
                onClick={() => setTab(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <Panel className="private-tab">
            {tab === "info" && (
              <div className="prose">
                <h2>Thông tin và bằng chứng</h2>
                <p>{book.description}</p>
                <h3>Tình trạng bản sách</h3>
                <p>{book.condition}</p>
                <h3>Yếu tố quý hiếm và nguồn đối chiếu</h3>
                <p>{book.evidence}</p>
                <div className="media-grid">
                  {book.media.map((item) => (
                    <figure key={item.id}>
                      <BookMedia media={item} />
                      <figcaption>{item.title}</figcaption>
                    </figure>
                  ))}
                </div>
                {book.status === "cho_kiem_duyet" && (
                  <Notice>
                    Bài đang chờ Admin kiểm duyệt, chưa xuất hiện trong danh mục
                    công khai. AI không tự quyết định phê duyệt.
                  </Notice>
                )}
                {book.status === "da_qua_kiem_duyet" && (
                  <Notice tone="success">
                    Bài đã được duyệt. Chủ sách có thể chọn lịch trong tương lai
                    và kích hoạt đúng phiên này.
                  </Notice>
                )}
              </div>
            )}
            {tab === "ai" && <AnalysisPanel auction={book} />}{" "}
            {tab === "history" && (
              <>
                <h2>Căn cứ kiểm duyệt được giữ lại</h2>
                {book.reviews?.length ? (
                  <ol className="review-history">
                    {book.reviews.map((item, index) => (
                      <li key={index}>
                        <Badge tone={item.approve ? "green" : "red"}>
                          {item.approve ? "Đã phê duyệt" : "Đã từ chối"}
                        </Badge>
                        <time>{date(item.at)}</time>
                        <p>{item.reason}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>
                    Chưa có quyết định mới trong phiên xem trước này.
                    {book.rejection && ` Lý do gần nhất: ${book.rejection}`}
                  </p>
                )}
              </>
            )}
          </Panel>
        </div>
      </div>
      {activate && (
        <ActivateDialog id={id} onClose={() => setActivate(false)} />
      )}
    </div>
  );
}
function ActivateDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const { run } = useDemo();
  const local = (offset: number) => {
    const value = new Date(Date.now() + offset);
    return new Date(value.getTime() - value.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  const [start, setStart] = useState(() => local(3600000)),
    [end, setEnd] = useState(() => local(86400000)),
    [error, setError] = useState("");
  return (
    <Dialog title="Đặt lịch và kích hoạt phiên" onClose={onClose}>
      <p>
        Bạn đang kích hoạt đúng phiên đã được duyệt. Ngày giờ hiển thị theo
        thiết bị, gửi Backend dưới dạng có múi giờ.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const first = Date.parse(start),
            last = Date.parse(end);
          if (
            !Number.isFinite(first) ||
            !Number.isFinite(last) ||
            first <= Date.now() ||
            last <= first
          ) {
            setError("Bắt đầu phải trong tương lai và kết thúc sau bắt đầu.");
            return;
          }
          if (
            run(
              {
                type: "activate",
                auctionId: id,
                startAt: new Date(first).toISOString(),
                endAt: new Date(last).toISOString(),
              },
              "Đã kích hoạt phiên minh họa.",
            )
          )
            onClose();
        }}
      >
        <label className="field">
          <span>Thời gian bắt đầu</span>
          <input
            type="datetime-local"
            required
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Thời gian kết thúc</span>
          <input
            type="datetime-local"
            required
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
        <Notice>
          Phiên kết thúc khi hết giờ hoặc có mức hợp lệ đạt điều kiện kết thúc
          sớm. Không có kết thúc thủ công.
        </Notice>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="button-row">
          <Button variant="outline" onClick={onClose}>
            Để sau
          </Button>
          <Button type="submit" variant="gold">
            Kích hoạt phiên
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
