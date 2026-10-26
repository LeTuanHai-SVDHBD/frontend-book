import { useEffect, useState } from "react";
import type { Route } from "../domain/types";
export function href(route: Route): string {
  return `#/${route.page}${"id" in route ? `/${route.id}` : ""}`;
}
export function go(route: Route) {
  window.location.hash = href(route).slice(1);
}
const singles = [
  "home",
  "catalog",
  "mine",
  "create",
  "trades",
  "complaints",
  "account",
  "moderation",
  "admin-complaints",
  "system",
];
const details = ["auction", "listing", "edit", "relist", "trade", "complaint"];
export function parseRoute(hash: string): Route {
  const [page, id] = hash.replace(/^#\/?/, "").split("?")[0].split("/");
  if (singles.includes(page)) return { page } as Route;
  if (details.includes(page) && /^[1-9]\d*$/.test(id || ""))
    return { page, id: Number(id) } as Route;
  return { page: "home" };
}
export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route;
}
