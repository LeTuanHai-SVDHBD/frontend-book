import { useEffect, useId, useRef, useState } from "react";
import type { Media } from "../domain/types";
import { digits, fold, money } from "../lib/format";
import { genreGroups } from "../demo/fixtures";
import { previewUrl, releaseUrl } from "../demo/media";
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
export function MediaPicker({
  value,
  onChange,
  imagesOnly = false,
}: {
  value: Media[];
  onChange: (value: Media[]) => void;
  imagesOnly?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null),
    [error, setError] = useState("");
  const imageCount = value.filter((item) => item.kind === "image").length,
    videoCount = value.length - imageCount;
  function add(files: FileList | null) {
    if (!files) return;
    let result = [...value];
    setError("");
    for (const file of Array.from(files)) {
      const image = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        ),
        video = !imagesOnly && ["video/mp4", "video/webm"].includes(file.type);
      if (!image && !video) {
        setError(
          "Chọn JPEG, PNG, WebP" + (imagesOnly ? "." : ", MP4 hoặc WebM."),
        );
        continue;
      }
      const count = result.filter(
          (item) => item.kind === (image ? "image" : "video"),
        ).length,
        max = image ? (imagesOnly ? 5 : 12) : 3;
      if (count >= max || file.size > (image ? 10 : 50) * 1048576) {
        setError(
          `Tối đa ${max} ${image ? "ảnh" : "video"}; mỗi tệp ${
            image ? 10 : 50
          } MB.`,
        );
        continue;
      }
      result = [
        ...result,
        {
          id: crypto.randomUUID(),
          url: previewUrl(file),
          title: file.name,
          kind: image ? "image" : "video",
          local: true,
        },
      ];
    }
    onChange(result);
    if (input.current) input.current.value = "";
  }
  return (
    <div>
      <div
        className="upload-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          add(event.dataTransfer.files);
        }}
      >
        <span className="upload-icon">
          <Icon name="upload" size={28} />
        </span>
        <div>
          <strong>
            Kéo thả {imagesOnly ? "ảnh bằng chứng" : "ảnh hoặc video"} vào đây
          </strong>
          <p>
            {imagesOnly
              ? "Tối đa 5 ảnh · 10 MB/ảnh"
              : "JPEG, PNG, WebP · 10 MB/ảnh; MP4, WebM · 50 MB/video"}
          </p>
        </div>
        <Button variant="outline" onClick={() => input.current?.click()}>
          Chọn tệp
        </Button>
        <input
          ref={input}
          className="sr-only"
          type="file"
          multiple
          aria-label={
            imagesOnly ? "Chọn ảnh bằng chứng" : "Chọn ảnh hoặc video sách"
          }
          accept={
            imagesOnly
              ? "image/jpeg,image/png,image/webp"
              : "image/jpeg,image/png,image/webp,video/mp4,video/webm"
          }
          onChange={(event) => add(event.target.files)}
        />
      </div>
      <p className="field-hint">
        Đã chọn {imageCount} ảnh{!imagesOnly && ` và ${videoCount} video`}. Tệp
        chỉ được xem trước trong phiên thiết kế này.
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <div className="media-grid">
        {value.map((item) => (
          <figure key={item.id}>
            {item.kind === "image" ? (
              <img src={item.url} alt={item.title} />
            ) : (
              <video controls src={item.url} />
            )}
            <figcaption title={item.title}>{item.title}</figcaption>
            <button
              type="button"
              className="media-remove"
              aria-label={`Bỏ ${item.title}`}
              onClick={() => {
                if (item.local) releaseUrl(item.url);
                onChange(value.filter((other) => other.id !== item.id));
              }}
            >
              ×
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}
