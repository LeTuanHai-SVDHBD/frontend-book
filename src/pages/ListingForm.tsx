import { useEffect, useRef, useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import type { ListingDraft } from "../domain/types";
import { canRelist, validPrices } from "../domain/rules";
import { go } from "../lib/router";
import { money } from "../lib/format";
import {
  Button,
  Dialog,
  EmptyState,
  Icon,
  LinkButton,
  Notice,
  PageHeading,
  Panel,
} from "../components/ui";
import { GenreField, MediaPicker, MoneyField } from "../components/fields";
export default function ListingForm({
  sourceId,
  mode = "create",
}: {
  sourceId?: number;
  mode?: "create" | "edit" | "relist";
}) {
  const { state, user, run } = useDemo(),
    source = state.auctions.find((book) => book.id === sourceId);
  const [step, setStep] = useState(0),
    [cancel, setCancel] = useState(false),
    [error, setError] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    heading = useRef<HTMLHeadingElement>(null);
  const [draft, setDraft] = useState<ListingDraft>(() => ({
    title: source?.title || "Vang Bóng Một Thời",
    postTitle: source?.postTitle || "Vang Bóng Một Thời — Bản sách sưu tầm",
    author: source?.author || "Nguyễn Tuân",
    publisher: source?.publisher || "Thông tin nhà xuất bản mẫu",
    year: source?.year ? String(source.year) : "1940",
    isbn: source?.isbn || "",
    genre: source?.genre || "Văn học cổ điển",
    description:
      source?.description || "Mô tả bản sách mẫu dùng để duyệt giao diện.",
    condition:
      source?.condition || "Bìa có dấu thời gian, trang ruột ngả màu nhẹ.",
    evidence:
      source?.evidence ||
      "Nguồn đối chiếu và ảnh trang xuất bản sẽ được bổ sung vào hồ sơ thật.",
    startPrice: source?.startPrice || "3500000",
    earlyPrice: source ? state.privatePrices[source.id] || "" : "9000000",
    step: source?.step || "50000",
    cooldown: source?.cooldown || 20,
    media: source?.media || state.auctions[0].media,
  }));
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const update = <K extends keyof ListingDraft>(
    key: K,
    value: ListingDraft[K],
  ) => setDraft((previous) => ({ ...previous, [key]: value }));
  const allowed =
    user?.role === "nguoi_dung" &&
    (mode === "create" ||
      (source?.sellerId === user.id &&
        (mode === "edit"
          ? source.status === "tu_choi"
          : canRelist(source) &&
            !state.auctions.some(
              (item) => item.bookId === source.bookId && item.id > source.id,
            ))));
  if (!allowed)
    return (
      <div className="page-container">
        <EmptyState
          title="Chưa thể mở biểu mẫu này"
          description={
            user
              ? "Chỉ chủ bài bị từ chối được bổ sung; chỉ phiên cuối không người thắng được đăng lại."
              : "Đăng nhập tài khoản người dùng để đăng sách."
          }
          action={
            <LinkButton to={{ page: user ? "mine" : "account" }}>
              {user ? "Về bài của tôi" : "Đăng nhập"}
            </LinkButton>
          }
        />
      </div>
    );
  function submit() {
    if (
      (step === 0 && (!draft.title.trim() || !draft.condition.trim())) ||
      (step === 1 && (!draft.evidence.trim() || !draft.postTitle.trim()))
    ) {
      setError("Vui lòng nhập đầy đủ nội dung, không chỉ khoảng trắng.");
      return;
    }
    if (
      step === 2 &&
      !validPrices(draft.startPrice, draft.earlyPrice, draft.step)
    ) {
      setError(
        "Nhập ba giá trị nguyên dương; giá kết thúc sớm phải từ giá khởi điểm trở lên.",
      );
      return;
    }
    if (step < 3) {
      if (step === 0 && !draft.postTitle) update("postTitle", draft.title);
      setError("");
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!confirmed) return;
    const id =
      mode === "edit"
        ? source!.id
        : Math.max(...state.auctions.map((book) => book.id)) + 1;
    if (
      run(
        { type: "listing", id, sourceId, mode, draft },
        "Đã gửi bài chờ kiểm duyệt trong bản xem trước.",
      )
    )
      go({ page: "listing", id });
  }
  const titles = [
    "Thông tin bản sách",
    "Ảnh, video và bằng chứng",
    "Thông số đấu giá",
    "Kiểm tra và gửi",
  ];
  return (
    <div className="page-container form-page">
      <div className="breadcrumb">
        <a href="#/mine">Bài của tôi</a>
        <span>/</span>
        <b>
          {mode === "edit"
            ? "Bổ sung bài bị từ chối"
            : mode === "relist"
              ? "Đăng lại bản sách"
              : "Đăng sách mới"}
        </b>
      </div>
      <PageHeading
        eyebrow="Không gian chủ sách"
        title={
          mode === "edit"
            ? "Bổ sung để được hiểu rõ hơn"
            : mode === "relist"
              ? "Một phiên mới cho bản sách cũ"
              : "Kể câu chuyện của bản sách"
        }
        description="Cung cấp đúng thông tin, thể hiện rõ tình trạng và để bằng chứng lên tiếng."
      />
      <ol className="stepper" aria-label="Các bước đăng sách">
        {titles.map((title, index) => (
          <li
            className={index <= step ? "active" : ""}
            aria-current={index === step ? "step" : undefined}
            key={title}
          >
            <span>
              {index < step ? (
                <Icon name="check" size={17} />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <b>{title}</b>
          </li>
        ))}
      </ol>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="wizard-layout">
          <Panel className="wizard-content">
            <div className="panel-heading">
              <span className="eyebrow">Bước {step + 1} / 4</span>
              <h2 ref={heading} tabIndex={-1}>
                {titles[step]}
              </h2>
            </div>
            {step === 0 && (
              <>
                {source && (
                  <Notice>
                    Giữ sách #{source.bookId} và lịch sử bản sách. Lần này chỉ
                    thay nội dung bài, ảnh/video và thông số phiên.
                  </Notice>
                )}
                <div className="form-grid">
                  <label className="field">
                    <span>
                      Tên sách <b>*</b>
                    </span>
                    <input
                      name="ten_sach"
                      value={draft.title}
                      readOnly={!!source}
                      onChange={(event) => update("title", event.target.value)}
                      required
                      maxLength={300}
                      placeholder="Ví dụ: Vang Bóng Một Thời"
                    />
                  </label>
                  <label className="field">
                    <span>Tác giả</span>
                    <input
                      value={draft.author}
                      readOnly={!!source}
                      onChange={(event) => update("author", event.target.value)}
                      maxLength={200}
                      placeholder="Họ và tên tác giả"
                    />
                  </label>
                  <label className="field">
                    <span>Nhà xuất bản</span>
                    <input
                      value={draft.publisher}
                      readOnly={!!source}
                      onChange={(event) =>
                        update("publisher", event.target.value)
                      }
                      maxLength={200}
                      placeholder="Theo trang xuất bản"
                    />
                  </label>
                  <label className="field">
                    <span>Năm xuất bản</span>
                    <input
                      inputMode="numeric"
                      value={draft.year}
                      readOnly={!!source}
                      onChange={(event) =>
                        update(
                          "year",
                          event.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      pattern="[1-9][0-9]{0,3}"
                      placeholder="Ví dụ: 1940"
                    />
                  </label>
                  {source ? (
                    <label className="field">
                      <span>Thể loại</span>
                      <input value={draft.genre} readOnly />
                    </label>
                  ) : (
                    <GenreField
                      value={draft.genre}
                      onChange={(value) => update("genre", value)}
                    />
                  )}
                  <label className="field">
                    <span>ISBN (nếu có)</span>
                    <input
                      value={draft.isbn}
                      readOnly={!!source}
                      onChange={(event) =>
                        update(
                          "isbn",
                          event.target.value
                            .replace(/[^0-9Xx]/g, "")
                            .toUpperCase()
                            .slice(0, 13),
                        )
                      }
                      pattern="(?:[0-9]{9}[0-9Xx]|[0-9]{13})"
                      placeholder="10 hoặc 13 ký tự"
                    />
                  </label>
                </div>
                <label className="field">
                  <span>
                    Tình trạng bản sách <b>*</b>
                  </span>
                  <textarea
                    value={draft.condition}
                    readOnly={!!source}
                    onChange={(event) =>
                      update("condition", event.target.value)
                    }
                    required
                    maxLength={1000}
                    rows={4}
                    placeholder="Bìa, gáy, trang ruột, vết ố hoặc phần bị thiếu…"
                  />
                </label>
                <label className="field">
                  <span>Giới thiệu sách</span>
                  <textarea
                    value={draft.description}
                    readOnly={!!source}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    maxLength={12000}
                    rows={3}
                    placeholder="Nội dung, câu chuyện hoặc điều đặc biệt của cuốn sách…"
                  />
                </label>
              </>
            )}
            {step === 1 && (
              <>
                <label className="field">
                  <span>
                    Tiêu đề bài đăng <b>*</b>
                  </span>
                  <input
                    name="tieu_de"
                    value={draft.postTitle}
                    onChange={(event) =>
                      update("postTitle", event.target.value)
                    }
                    maxLength={300}
                    required
                    placeholder="Tiêu đề giới thiệu đúng bản sách"
                  />
                </label>
                <MediaPicker
                  value={draft.media}
                  onChange={(value) => update("media", value)}
                />
                <label className="field">
                  <span>
                    Tình trạng, yếu tố quý hiếm và bằng chứng <b>*</b>
                  </span>
                  <textarea
                    value={draft.evidence}
                    onChange={(event) => update("evidence", event.target.value)}
                    required
                    maxLength={12000}
                    rows={6}
                    placeholder="Ấn bản nào? Căn cứ phát hành giới hạn? Nguồn đối chiếu? Những khuyết điểm cần lưu ý?"
                  />
                </label>
                <Notice tone="warning">
                  Không khẳng định chữ ký thật, nguồn gốc hoặc số bản còn lại
                  nếu chưa có căn cứ. Ảnh chưa thấy không đồng nghĩa bộ phận đã
                  mất.
                </Notice>
              </>
            )}
            {step === 2 && (
              <>
                <div className="form-grid">
                  <MoneyField
                    name="gia_khoi_diem"
                    label="Giá khởi điểm *"
                    value={draft.startPrice}
                    onChange={(value) => update("startPrice", value)}
                  />
                  <MoneyField
                    name="buoc_gia"
                    label="Bước giá *"
                    value={draft.step}
                    onChange={(value) => update("step", value)}
                  />
                  <MoneyField
                    name="gia_toi_thieu"
                    label="Giá kết thúc sớm *"
                    value={draft.earlyPrice}
                    onChange={(value) => update("earlyPrice", value)}
                  />
                  <label className="field">
                    <span>Chờ đặt lại</span>
                    <select
                      aria-label="Chờ đặt lại"
                      value={draft.cooldown}
                      onChange={(event) =>
                        update("cooldown", Number(event.target.value))
                      }
                    >
                      {[10, 15, 20, 25, 30].map((value) => (
                        <option key={value} value={value}>
                          {value} giây
                        </option>
                      ))}
                    </select>
                    <small className="field-hint">
                      Theo từng người tham gia trong cùng phiên.
                    </small>
                  </label>
                </div>
                <Notice>
                  <b>Giá kết thúc sớm được giữ riêng.</b>
                  <p>
                    Chỉ chủ sách và Admin được xem. Đạt hoặc vượt mức này bằng
                    lượt hợp lệ thì phiên kết thúc sớm.
                  </p>
                </Notice>
                <Notice tone="warning">
                  Chưa đặt lịch ở bước này. Sau khi Admin duyệt, bạn mới chọn
                  giờ bắt đầu, giờ kết thúc và kích hoạt đúng phiên.
                </Notice>
              </>
            )}
            {step === 3 && (
              <>
                <div className="review-book-summary">
                  <img
                    src={
                      draft.media.find((item) => item.kind === "image")?.url ||
                      source?.cover ||
                      "/covers/book-7.svg"
                    }
                    alt="Bản sách đang gửi"
                  />
                  <div>
                    <BadgeLabel />
                    <h3>{draft.title}</h3>
                    <p>
                      {draft.author || "Chưa cung cấp tác giả"} ·{" "}
                      {draft.year || "Chưa cung cấp năm"}
                    </p>
                    <span>{draft.media.length} tệp minh họa đã chọn</span>
                  </div>
                </div>
                <dl className="summary-list">
                  <div>
                    <dt>Giá khởi điểm</dt>
                    <dd>{money(draft.startPrice)}</dd>
                  </div>
                  <div>
                    <dt>Bước giá</dt>
                    <dd>{money(draft.step)}</dd>
                  </div>
                  <div>
                    <dt>Giá kết thúc sớm (riêng tư)</dt>
                    <dd>{money(draft.earlyPrice)}</dd>
                  </div>
                  <div>
                    <dt>Thời gian chờ đặt lại</dt>
                    <dd>{draft.cooldown} giây</dd>
                  </div>
                  <div>
                    <dt>Lịch đấu giá</dt>
                    <dd>Đặt sau khi được duyệt</dd>
                  </div>
                </dl>
                <Notice>
                  Gửi bài sẽ tạo trạng thái chờ kiểm duyệt. AI phân tích để hỗ
                  trợ; Admin tiếp tục là người quyết định.
                </Notice>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    required
                  />
                  <span>
                    Tôi đã kiểm tra thông tin bản sách và nêu rõ phần còn cần
                    xác minh.
                  </span>
                </label>
              </>
            )}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="wizard-actions">
              <Button variant="ghost" onClick={() => setCancel(true)}>
                Hủy
              </Button>
              <div>
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep((value) => value - 1);
                      setError("");
                    }}
                  >
                    Quay lại
                  </Button>
                )}
                <Button
                  type="submit"
                  variant={step === 3 ? "gold" : "primary"}
                  icon={step === 3 ? "check" : "arrow"}
                >
                  {step === 3 ? "Gửi kiểm duyệt" : "Tiếp tục"}
                </Button>
              </div>
            </div>
          </Panel>
          <aside className="wizard-help">
            <span className="help-number">
              {String(step + 1).padStart(2, "0")}
            </span>
            <h3>
              {
                [
                  "Một bản sách cụ thể",
                  "Bằng chứng rõ ràng hơn",
                  "Một phiên đấu giá rõ ràng",
                  "Kiểm tra trước khi gửi",
                ][step]
              }
            </h3>
            <p>
              {
                [
                  "Mỗi bài đăng đại diện cho một cuốn sách vật lý. Hãy đọc thông tin từ chính bản sách, thay vì từ một ấn bản khác.",
                  "Nên có ảnh bìa, trang xuất bản, gáy và liên kết, trang ruột, mép giấy và bìa áo nếu có.",
                  "Nhập tiền bằng chữ số. Dòng xem trước giúp bạn kiểm tra giá trị; không tự thêm chữ số trong khi gõ.",
                  "Bài chờ duyệt chưa xuất hiện công khai. Bạn theo dõi trạng thái, phân tích và căn cứ kiểm duyệt trong Bài của tôi.",
                ][step]
              }
            </p>
            <div>
              <Icon name="shield" size={20} />
              <span>Thông tin đầy đủ giúp việc kiểm duyệt có căn cứ.</span>
            </div>
          </aside>
        </div>
      </form>
      {cancel && (
        <Dialog title="Rời biểu mẫu?" onClose={() => setCancel(false)}>
          <p>
            Thông tin chưa gửi trong biểu mẫu này sẽ không được tạo thành bài
            đăng.
          </p>
          <div className="button-row">
            <Button variant="outline" onClick={() => setCancel(false)}>
              Tiếp tục điền
            </Button>
            <Button onClick={() => go({ page: "mine" })}>Rời biểu mẫu</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
function BadgeLabel() {
  return <span className="eyebrow">Kiểm tra bản sách</span>;
}
