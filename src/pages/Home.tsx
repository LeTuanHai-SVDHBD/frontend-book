import { useState } from "react";
import { useDemo } from "../demo/DemoProvider";
import { phase } from "../domain/rules";
import useClock from "../lib/useClock";
import BookCard from "../components/BookCard";
import { Badge, Button, Icon, LinkButton } from "../components/ui";
export default function Home() {
  const { state, user } = useDemo(),
    now = useClock(),
    [search, setSearch] = useState("");
  const live = state.auctions.filter((book) => phase(book, now) === "live");
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              <span />
              Không gian dành cho người sưu tầm
            </p>
            <h1>
              Mỗi ấn bản,
              <br />
              một câu chuyện
              <br />
              <em>đáng gìn giữ.</em>
            </h1>
            <p className="hero-description">
              Khám phá những bản sách mang dấu ấn thời gian.
              <br className="desktop-only" /> Đấu giá công khai, kết nối với
              người cùng trân trọng.
            </p>
            <div className="hero-actions">
              <LinkButton to={{ page: "catalog" }} icon="arrow">
                Khám phá đấu giá
              </LinkButton>
              <a
                href="#how-it-works"
                className="text-link"
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Cách tham gia <Icon name="chevron" size={16} />
              </a>
            </div>
            <div className="hero-meta">
              <div className="avatar-stack">
                <span>MA</span>
                <span>TN</span>
                <span>TH</span>
              </div>
              <span>
                Một cộng đồng,
                <br />
                <b>chung niềm yêu sách.</b>
              </span>
              <span className="hero-meta-divider" />
              <div>
                <b>{live.length} phiên</b>
                <span>đang diễn ra trong bản mẫu</span>
              </div>
            </div>
          </div>
          <div className="hero-display">
            <div className="exhibit-ring ring-one" />
            <div className="exhibit-ring ring-two" />
            <span className="exhibit-caption">THE BOOK COLLECTOR'S CORNER</span>
            <img
              src="/covers/book-2.svg"
              className="hero-book hero-book-back"
              alt="Bìa minh họa Truyện Kiều"
            />
            <img
              src="/covers/book-1.svg"
              className="hero-book hero-book-front"
              alt="Bìa minh họa Vang Bóng Một Thời"
            />
            <div className="exhibit-base" />
            <div className="featured-label">
              <Badge tone="gold">Ấn bản đang được quan tâm</Badge>
              <strong>Vang Bóng Một Thời</strong>
              <span>Nguyễn Tuân · Thông tin ấn bản minh họa</span>
              <a href="#/auction/101">
                Xem phiên đấu giá <Icon name="arrow" size={17} />
              </a>
            </div>
            <div className="edition-stamp">
              <span>BOOK</span>
              <Icon name="book" size={24} />
              <span>STORIES</span>
            </div>
          </div>
        </div>
      </section>
      <div className="trust-strip">
        <span>
          <Icon name="shield" />
          Kiểm duyệt trước khi đấu giá
        </span>
        <span>
          <Icon name="gavel" />
          Lịch sử đặt giá công khai
        </span>
        <span>
          <Icon name="chat" />
          Trao đổi riêng sau phiên
        </span>
      </div>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Những câu chuyện đang chờ chủ mới</p>
            <h2>
              Đang trên sàn đấu giá<span>.</span>
            </h2>
          </div>
          <a href="#/catalog" className="text-link">
            Xem tất cả phiên <Icon name="arrow" size={18} />
          </a>
        </div>
        <form
          className="home-search"
          onSubmit={(event) => {
            event.preventDefault();
            window.location.hash = `/catalog?q=${encodeURIComponent(search)}`;
          }}
        >
          <Icon name="search" />
          <input
            aria-label="Tìm ấn bản yêu thích"
            placeholder="Tìm ấn bản, tác giả bạn yêu thích…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit" small variant="outline">
            Tìm sách
          </Button>
        </form>
        <div className="book-grid home-book-grid">
          {live.slice(0, 4).map((auction) => (
            <BookCard key={auction.id} auction={auction} now={now} />
          ))}
        </div>
      </section>
      <section id="how-it-works" className="process-section">
        <div className="process-intro">
          <p className="eyebrow">Rõ ràng ở từng bước</p>
          <h2>
            Từ trang sách cũ,
            <br />
            đến một hành trình mới.
          </h2>
          <p>
            Mỗi phiên bắt đầu bằng thông tin rõ ràng và kết thúc bằng sự xác
            nhận của hai bên.
          </p>
          <LinkButton
            to={{
              page:
                user?.role === "admin"
                  ? "moderation"
                  : user
                    ? "create"
                    : "account",
            }}
            variant="outline"
          >
            {user?.role === "admin"
              ? "Đến kiểm duyệt"
              : "Bắt đầu với bản sách của bạn"}
          </LinkButton>
        </div>
        <div className="process-list">
          {[
            {
              n: "01",
              title: "Cung cấp thông tin và bằng chứng",
              text: "Ảnh, video và mô tả giúp Admin đối chiếu đúng bản sách.",
            },
            {
              n: "02",
              title: "Kiểm duyệt trước, kích hoạt sau",
              text: "AI hỗ trợ phân tích; Admin là người quyết định. Chủ sách đặt lịch sau khi bài được duyệt.",
            },
            {
              n: "03",
              title: "Đặt giá, theo dõi và xác nhận",
              text: "Giá và kết quả được đồng bộ. Người thắng cùng người bán trao đổi và xác nhận hoàn tất.",
            },
          ].map((step) => (
            <div key={step.n}>
              <span>{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="seller-band">
        <div className="seller-band-art">
          <Icon name="book" size={60} />
          <span>
            Một bản sách.
            <br />
            Một giá trị riêng.
          </span>
        </div>
        <div>
          <p className="eyebrow">Dành cho chủ sách</p>
          <h2>
            Để sách được gặp
            <br />
            đúng người trân trọng.
          </h2>
          <p>
            Giới thiệu bản sách, bổ sung bằng chứng và theo dõi toàn bộ quá
            trình trong một không gian.
          </p>
          <LinkButton
            to={{ page: user?.role === "nguoi_dung" ? "create" : "account" }}
            variant="gold"
            icon="plus"
          >
            Đăng sách để đấu giá
          </LinkButton>
        </div>
      </section>
    </>
  );
}
