import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { isPublic, phase } from "../domain/rules";
import { fold } from "../lib/format";
import useClock from "../lib/useClock";
import BookCard from "../components/BookCard";
import {
  Button,
  EmptyState,
  Icon,
  LinkButton,
  PageHeading,
  Pager,
} from "../components/ui";
export default function Catalog() {
  const { state } = useDemo(),
    now = useClock(),
    [search, setSearch] = useState(
      () =>
        new URLSearchParams(window.location.hash.split("?")[1]).get("q") || "",
    ),
    [status, setStatus] = useState("all"),
    [genre, setGenre] = useState("all"),
    [sort, setSort] = useState("newest"),
    [page, setPage] = useState(1);
  const publicBooks = state.auctions.filter(isPublic),
    genres = [...new Set(publicBooks.map((book) => book.genre))];
  const filtered = publicBooks
    .filter(
      (book) =>
        (status === "all" || phase(book, now) === status) &&
        (genre === "all" || book.genre === genre) &&
        fold(`${book.title} ${book.author} ${book.isbn}`).includes(
          fold(search),
        ),
    )
    .sort((a, b) =>
      sort === "price"
        ? BigInt(a.currentPrice || a.startPrice) <
          BigInt(b.currentPrice || b.startPrice)
          ? -1
          : 1
        : sort === "ending"
          ? Date.parse(a.endAt || "") - Date.parse(b.endAt || "")
          : b.id - a.id,
    );
  const count = Math.max(1, Math.ceil(filtered.length / 6)),
    currentPage = Math.min(page, count);
  return (
    <div className="page-container">
      <div className="breadcrumb">
        <a href="#/home">Trang chủ</a>
        <span>/</span>
        <b>Khám phá</b>
      </div>
      <PageHeading
        eyebrow="Dành cho người yêu sách"
        title="Tìm một ấn bản thuộc về bạn"
        description="Theo dõi phiên đấu giá, đọc thông tin bản sách và lựa chọn bằng sự hiểu biết."
      />
      <form
        className="catalog-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Icon name="search" size={22} />
        <input
          aria-label="Tìm sách, tác giả hoặc ISBN"
          placeholder="Tên sách, tác giả hoặc ISBN bạn đang tìm…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        {search && (
          <button
            type="button"
            className="icon-button"
            aria-label="Xóa tìm kiếm"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
          >
            <Icon name="close" size={18} />
          </button>
        )}
        <Button type="submit">Tìm kiếm</Button>
      </form>
      <div className="catalog-toolbar">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Lọc trạng thái phiên"
        >
          {(
            [
              ["all", "Tất cả"],
              ["live", "Đang đấu giá"],
              ["scheduled", "Sắp diễn ra"],
              ["ended", "Đã kết thúc"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={status === value}
              className={status === value ? "active" : ""}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="select-filters">
          <label>
            <span className="sr-only">Thể loại</span>
            <select
              aria-label="Lọc thể loại"
              value={genre}
              onChange={(event) => {
                setGenre(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả thể loại</option>
              {genres.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <select
            aria-label="Sắp xếp phiên"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="ending">Kết thúc sớm nhất</option>
            <option value="price">Giá tăng dần</option>
          </select>
        </div>
      </div>
      <div className="results-line">
        <span>
          <b>{filtered.length}</b> phiên phù hợp
        </span>
        <span>
          <Icon name="shield" size={15} />
          Chỉ hiển thị bài đã duyệt và kích hoạt
        </span>
      </div>
      {filtered.length ? (
        <>
          <div className="book-grid">
            {filtered
              .slice((currentPage - 1) * 6, currentPage * 6)
              .map((auction) => (
                <BookCard key={auction.id} auction={auction} now={now} />
              ))}
          </div>
          <Pager page={currentPage} total={count} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          title="Chưa tìm thấy ấn bản phù hợp"
          description="Thử tên tác giả khác hoặc bỏ bớt bộ lọc."
          action={
            <Button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setGenre("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          }
        />
      )}
      <div className="catalog-bottom">
        <Icon name="book" size={30} />
        <div>
          <h2>Bạn cũng có một câu chuyện để chia sẻ?</h2>
          <p>Đưa bản sách của bạn đến với người biết trân trọng.</p>
        </div>
        <LinkButton
          to={{ page: state.viewer === "guest" ? "account" : "create" }}
          variant="outline"
          icon="plus"
        >
          Đăng sách của bạn
        </LinkButton>
      </div>
    </div>
  );
}
