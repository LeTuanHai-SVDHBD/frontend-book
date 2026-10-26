/** Currency stays a decimal string across inputs and view models. */
export const digits = (value: string) =>
  value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
export const money = (value: string | null) =>
  value === null
    ? "Chưa có lượt giá"
    : `${BigInt(value).toLocaleString("vi-VN")} ₫`;
export const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa xác nhận";
export const shortDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa đặt lịch";
export const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
export function duration(ms: number) {
  const value = Math.max(0, Math.ceil(ms / 1000));
  return [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(" : ");
}
