import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import type { ListingStatus } from "../domain/types";
import { href } from "../lib/router";
import type { Route } from "../domain/types";
export type IconName =
  | "search"
  | "arrow"
  | "book"
  | "gavel"
  | "clock"
  | "check"
  | "chevron"
  | "menu"
  | "close"
  | "plus"
  | "upload"
  | "chat"
  | "shield"
  | "file"
  | "logout"
  | "grid"
  | "alert"
  | "star"
  | "image";
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    book: (
      <>
        <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16" />
      </>
    ),
    gavel: (
      <>
        <path d="m14 4 6 6-4 4-6-6zM8 10l6 6M3 21l9-9M15 20h7" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    plus: <path d="M12 4v16M4 12h16" />,
    upload: (
      <>
        <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />
      </>
    ),
    chat: <path d="M4 4h16v13H9l-5 4z" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    file: (
      <>
        <path d="M5 3h9l5 5v13H5zM14 3v6h5M8 13h8M8 17h6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2zM12 9v4" />
        <circle cx="12" cy="17" r=".5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="2" />
        <path d="m21 15-6-5L4 21" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost" | "danger";
  small?: boolean;
  icon?: IconName;
}
export function Button({
  children,
  variant = "primary",
  small = false,
  icon,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${small ? "btn-small" : ""} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={small ? 16 : 18} />}
      <span>{children}</span>
    </button>
  );
}
export function LinkButton({
  to,
  children,
  variant = "primary",
  icon,
}: {
  to: Route;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  icon?: IconName;
}) {
  return (
    <a href={href(to)} className={`btn btn-${variant}`}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </a>
  );
}
export function Badge({
  children,
  tone = "navy",
  dot = false,
}: {
  children: ReactNode;
  tone?: "navy" | "gold" | "green" | "red" | "gray" | "orange";
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <i />}
      {children}
    </span>
  );
}
export const listingLabels: Record<ListingStatus, string> = {
  cho_kiem_duyet: "Chờ kiểm duyệt",
  tu_choi: "Cần bổ sung",
  da_qua_kiem_duyet: "Đã duyệt · chờ kích hoạt",
  da_kich_hoat: "Đã kích hoạt",
  da_ket_thuc: "Đã kết thúc",
};
export function ListingBadge({ status }: { status: ListingStatus }) {
  return (
    <Badge
      tone={
        status === "tu_choi"
          ? "red"
          : status === "cho_kiem_duyet"
            ? "orange"
            : status === "da_ket_thuc"
              ? "gray"
              : "green"
      }
      dot
    >
      {listingLabels[status]}
    </Badge>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`panel ${className}`} {...props}>
      {children}
    </section>
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon = "book",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={`notice notice-${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon
        name={
          tone === "success"
            ? "check"
            : tone === "warning" || tone === "danger"
              ? "alert"
              : "file"
        }
        size={19}
      />
      <div>{children}</div>
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${wide ? "dialog-wide" : ""}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Đóng hộp thoại"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
export function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="stars" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            type="button"
            key={n}
            aria-label={`${n} sao`}
            aria-pressed={n === value}
            className={n <= value ? "filled" : ""}
            onClick={() => onChange(n)}
          >
            ★
          </button>
        ) : (
          <span key={n} className={n <= value ? "filled" : ""}>
            ★
          </span>
        ),
      )}
    </div>
  );
}
export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total < 2) return null;
  return (
    <nav className="pagination" aria-label="Phân trang">
      <Button
        small
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Trước
      </Button>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          aria-current={page === i + 1 ? "page" : undefined}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <Button
        small
        variant="outline"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        Tiếp
      </Button>
    </nav>
  );
}
