import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { phase } from "../domain/rules";
import useClock from "../lib/useClock";
import BookCard from "../components/BookCard";
import { Badge, Button, Icon, LinkButton, Panel } from "../components/ui";
export default function Home() {
  const { state, explain } = useDemo(),
    now = useClock(),
    [query, setQuery] = useState("");
  const books = state.auctions.filter((book) => phase(book, now) === "live");
  return (
    <>
      <section className="figma-hero">
        <div className="figma-hero-copy">
          <Badge tone="gold">Không gian dành cho người yêu sách</Badge>
          <h1>
            Mỗi cuốn sách quý,
            <br />
            <em>một câu chuyện vô giá.</em>
          </h1>
          <p>
            Khám phá những bản sách mang dấu ấn thời gian. Đấu giá công khai,
            kết nối cùng những người trân trọng sách.
          </p>
          <form
            className="figma-hero-search"
            onSubmit={(event) => {
              event.preventDefault();
              explain(
                "Thiết kế ô tìm kiếm: sau này tìm theo tên sách, tác giả, ISBN và thể loại từ dữ liệu hệ thống. Hiện chỉ là mẫu giao diện.",
              );
            }}
          >
            <Icon name="search" size={30} />
            <input
              aria-label="Tìm cuốn sách bạn yêu thích"
              placeholder="Bạn đang tìm cuốn sách nào?"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit" variant="gold">
              Tìm kiếm
            </Button>
          </form>
          <div className="figma-trust-row">
            <b>
              01<span>Bản sách / phiên</span>
            </b>
            <b>
              04<span>Ảnh chi tiết mẫu</span>
            </b>
            <b>
              01<span>Video giới thiệu</span>
            </b>
          </div>
        </div>
        <div className="figma-hero-image">
          <img
            src="/assets/figma/library.jpg"
            alt="Không gian thư viện trong thiết kế BookBid gốc"
          />
          <Panel>
            <Icon name="shield" size={32} />
            <div>
              <b>Kiểm duyệt trước đấu giá</b>
              <span>Thông tin rõ ràng, bằng chứng đầy đủ</span>
            </div>
          </Panel>
        </div>
      </section>
      <section className="figma-section">
        <h2>Khám phá theo thể loại</h2>
        <div className="figma-chips">
          {["Văn học", "Sách cổ", "Sách hiếm", "Thơ ca", "Tư liệu"].map(
            (item, index) => (
              <a
                href="#/catalog"
                className={index === 1 ? "active" : ""}
                key={item}
              >
                {item}
              </a>
            ),
          )}
        </div>
      </section>
      <section className="figma-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Phiên đấu giá trực tiếp</span>
            <h2>Đang đấu giá</h2>
          </div>
          <LinkButton variant="outline" to={{ page: "catalog" }}>
            Xem tất cả
          </LinkButton>
        </div>
        <div className="home-book-grid">
          {books.map((book) => (
            <BookCard key={book.id} auction={book} now={now} />
          ))}
        </div>
      </section>
      <section className="figma-section figma-feature-band">
        <div>
          <span className="eyebrow">Từng bản sách, từng câu chuyện</span>
          <h2>Sách nổi bật</h2>
          <p>
            Ảnh bìa, gáy, trang ruột và video giúp bạn xem rõ bản sách trước khi
            tham gia phiên.
          </p>
          <LinkButton variant="gold" to={{ page: "auction", id: 101 }}>
            Khám phá ngay
          </LinkButton>
        </div>
        <div className="featured-single-book">
          <img
            src="/covers/book-1.svg"
            alt="Bìa sách minh họa Vang Bóng Một Thời"
          />
        </div>
        <div>
          <span className="eyebrow">Đừng bỏ lỡ</span>
          <h2>Phiên sắp kết thúc</h2>
          <strong>00 : 35 : 00</strong>
          <p>“Truyện Kiều” — Nguyễn Du</p>
          <span className="design-label">
            Thời gian mẫu · Không chạy đấu giá thật
          </span>
        </div>
      </section>
    </>
  );
}
