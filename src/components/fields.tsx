import BookMedia from "./BookMedia";
import { useEffect, useId, useRef, useState } from "react";
import type { Media } from "../domain/types";
import { digits, fold, money } from "../lib/format";
import { genreGroups } from "../demo/fixtures";
import { useDemo } from "../demo/DemoProvider";
import { Button, Icon } from "./ui";
export function MoneyField({
  label,
  value,
  onChange,
  name,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
}) {
  const [draft, setDraft] = useState(value),
    [error, setError] = useState(""),
    composing = useRef(false);
  useEffect(() => {
    if (!composing.current) setDraft(value);
  }, [value]);
  function accept(raw: string) {
    const next = digits(raw);
    if (next.length > 18) {
      setError("Tối đa 18 chữ số.");
      setDraft(value);
      return;
    }
    setDraft(next);
    onChange(next);
    setError("");
  }
  return (
    <label className="field">
      <span>{label}</span>
      <div className="money-input">
        <input
          aria-label={label}
          name={name}
          value={draft}
          inputMode="numeric"
          autoComplete="off"
          required={required}
          pattern="[0-9]{1,18}"
          onChange={(event) => {
            if (composing.current) {
              setDraft(event.target.value);
              return;
            }
            accept(event.target.value);
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            accept(event.currentTarget.value);
          }}
        />
        <span>VND</span>
      </div>
      <small className={error ? "field-error" : "field-hint"}>
        {error ||
          (value
            ? `Giá trị: ${money(value)}`
            : "Nhập số nguyên, không cần dấu phân cách.")}
      </small>
    </label>
  );
}
export function GenreField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId(),
    input = useRef<HTMLInputElement>(null),
    [query, setQuery] = useState(value),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const groups = genreGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          fold(item).includes(fold(query === value ? "" : query)),
        ),
      }))
      .filter((group) => group.items.length),
    items = groups.flatMap((group) => group.items);
  useEffect(() => {
    if (open && active >= 0)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);
  function choose(item: string) {
    setQuery(item);
    onChange(item);
    setOpen(false);
    setActive(-1);
    input.current?.setCustomValidity("");
  }
  return (
    <div
      className="field genre-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={id}>Thể loại</label>
      <div className="genre-input">
        <input
          id={id}
          ref={input}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          value={query}
          placeholder="Tìm hoặc chọn thể loại"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange("");
            setOpen(true);
            setActive(-1);
            event.target.setCustomValidity(
              event.target.value
                ? "Chọn một thể loại trong danh sách hoặc để trống."
                : "",
            );
          }}
          onKeyDown={(event) => {
            if (["ArrowDown", "ArrowUp"].includes(event.key)) {
              event.preventDefault();
              setOpen(true);
              setActive((index) =>
                items.length
                  ? (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      items.length) %
                    items.length
                  : -1,
              );
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              if (items[active < 0 ? 0 : active])
                choose(items[active < 0 ? 0 : active]);
            } else if (event.key === "Escape") setOpen(false);
          }}
        />
        <button
          type="button"
          aria-label="Mở danh sách thể loại"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            input.current?.focus();
            setOpen(!open);
          }}
        >
          <Icon name="chevron" />
        </button>
      </div>
      {open && (
        <div
          id={`${id}-list`}
          className="genre-options"
          role="listbox"
          aria-label="Thể loại sách"
        >
          {groups.map((group) => (
            <div key={group.name} role="group" aria-label={group.name}>
              <strong>{group.name}</strong>
              {group.items.map((item) => {
                const index = items.indexOf(item);
                return (
                  <button
                    key={item}
                    id={`${id}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={value === item}
                    className={index === active ? "active" : ""}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          ))}
          {!items.length && <p>Không có kết quả. Thử từ khóa khác.</p>}
        </div>
      )}
      <small className="field-hint">
        Có thể tìm không dấu; nhập để tìm, rồi chọn một mục.
      </small>
    </div>
  );
}
/** Visual upload slots only: no file is read or uploaded by this design. */
export function MediaPicker({
  value,
  imagesOnly = false,
}: {
  value: Media[];
  onChange: (value: Media[]) => void;
  imagesOnly?: boolean;
}) {
  const { explain } = useDemo();
  return (
    <div>
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          explain(
            "Thiết kế vùng tải tệp. Sau này bổ sung kiểm tra tệp, vé upload và Cloudinary ở dự án chính.",
          );
        }}
      >
        <span className="upload-icon">
          <Icon name="upload" size={40} />
        </span>
        <div>
          <strong>
            {imagesOnly
              ? "Ảnh bằng chứng"
              : "Ảnh và video của cùng một bản sách"}
          </strong>
          <p>
            {imagesOnly
              ? "JPEG, PNG, WebP · Tối đa 5 ảnh"
              : "JPEG, PNG, WebP · Tối đa 12 ảnh; MP4, WebM · Tối đa 3 video"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            explain(
              "Nút chọn tệp — chỉ là thiết kế. Chưa đọc hoặc tải tệp lên hệ thống.",
            )
          }
        >
          Chọn tệp
        </Button>
      </div>
      <p className="field-hint">
        {value.length
          ? `${value.filter((item) => item.kind === "image").length} ảnh và ${value.filter((item) => item.kind === "video").length} video minh họa`
          : "Vị trí xem trước tệp mẫu"}{" "}
        · Không upload tệp thật.
      </p>
      <div className="media-grid">
        {value.map((item) => (
          <figure key={item.id}>
            <BookMedia media={item} />
            <figcaption>{item.title}</figcaption>
            <button
              type="button"
              className="media-remove"
              aria-label={`Bỏ ${item.title}`}
              onClick={() =>
                explain(
                  "Thiết kế thao tác bỏ ảnh/video trước khi gửi bài. Dữ liệu mẫu được giữ nguyên.",
                )
              }
            >
              ×
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}
