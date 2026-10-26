/** All books, covers, identities and evidence below are illustrative design fixtures, not appraised listings. */
import type {
  Analysis,
  Auction,
  DemoState,
  User,
  Viewer,
} from "../domain/types";
export const users: Record<Exclude<Viewer, "guest">, User> = {
  buyer: {
    id: 2,
    name: "Lê Minh An",
    initials: "MA",
    role: "nguoi_dung",
    email: "minhan@example.test",
  },
  seller: {
    id: 1,
    name: "Nguyễn Thành Nam",
    initials: "TN",
    role: "nguoi_dung",
    email: "thanhnam@example.test",
  },
  admin: {
    id: 4,
    name: "Admin Phương",
    initials: "AP",
    role: "admin",
    email: "admin@example.test",
  },
  "admin-other": {
    id: 5,
    name: "Admin Huy",
    initials: "AH",
    role: "admin",
    email: "admin-huy@example.test",
  },
};
export const userName = (id: number) =>
  Object.values(users).find((user) => user.id === id)?.name ||
  `Người tham gia #${id}`;
export const demoRarity: Analysis["rarity"] = [
  {
    id: "limited_edition",
    name: "Ấn bản giới hạn",
    weight: 25,
    score: 100,
    status: "assessed",
    observation:
      "Thông tin số bản trên trang xuất bản cần được Admin đối chiếu.",
    evidence: "Ảnh trang xuất bản · minh họa",
  },
  {
    id: "special_edition",
    name: "Ấn bản đặc biệt và lịch sử xuất bản",
    weight: 25,
    score: 0,
    status: "assessed",
    observation: "Chưa có dấu hiệu của ấn bản đặc biệt trong nguồn cung cấp.",
    evidence: "Mô tả của người đăng",
  },
  {
    id: "historical_context",
    name: "Niên đại và bối cảnh lịch sử",
    weight: 25,
    score: 100,
    status: "assessed",
    observation: "Có năm xuất bản trong ảnh tên sách.",
    evidence: "Ảnh trang tên · minh họa",
  },
  {
    id: "provenance",
    name: "Lai lịch và dấu ấn riêng",
    weight: 25,
    score: 100,
    status: "assessed",
    observation: "Có ghi chú sở hữu; không khẳng định tính thật của chữ ký.",
    evidence: "Ảnh trang lót · minh họa",
  },
];
export const demoPhysical: Analysis["physical"] = [
  {
    id: "cover",
    name: "Bìa",
    weight: 20,
    score: 75,
    status: "assessed",
    observation: "Sờn nhẹ tại góc bìa.",
    evidence: "Ảnh bìa trước",
  },
  {
    id: "spine",
    name: "Gáy và liên kết",
    weight: 25,
    score: null,
    status: "missing",
    observation: "Chưa có góc chụp đủ rõ để đánh giá liên kết.",
    evidence: "Cần thêm ảnh gáy",
  },
  {
    id: "pages",
    name: "Trang ruột",
    weight: 30,
    score: 75,
    status: "assessed",
    observation: "Ngả màu nhẹ trên những trang quan sát được.",
    evidence: "Ảnh trang ruột",
  },
  {
    id: "edges",
    name: "Mép giấy",
    weight: 15,
    score: 50,
    status: "assessed",
    observation: "Vết ố cục bộ ở mép giấy.",
    evidence: "Ảnh cạnh sách",
  },
  {
    id: "dust_jacket",
    name: "Bìa áo",
    weight: 10,
    score: null,
    status: "verify",
    observation: "Cần xác minh ấn bản vốn có bìa áo hay không.",
    evidence: "Chưa đủ dữ liệu",
  },
];
export const genreGroups = [
  {
    name: "Văn học và hư cấu",
    items: [
      "Văn học cổ điển",
      "Văn học đương đại",
      "Kịch nghệ",
      "Thơ ca",
      "Kỳ ảo",
      "Khoa học viễn tưởng",
      "Tận thế và hậu tận thế",
      "Trinh thám",
      "Giật gân và ly kỳ",
      "Kinh dị",
      "Lãng mạn",
      "Đời thường",
      "Tiểu thuyết lịch sử",
      "Manga",
      "Manhua",
      "Manhwa",
      "Tiểu thuyết đồ họa",
      "Truyện ngắn và tản văn",
      "Văn học dân gian",
    ],
  },
  {
    name: "Kiến thức và phi hư cấu",
    items: [
      "Phát triển bản thân",
      "Tâm lý học",
      "Tiểu sử và hồi ký",
      "Lịch sử",
      "Quản trị và lãnh đạo",
      "Tài chính cá nhân và đầu tư",
      "Marketing và bán hàng",
      "Kinh tế và khởi nghiệp",
      "Khoa học phổ thông",
      "Công nghệ thông tin",
      "Sách giáo khoa và giáo trình",
      "Ẩm thực",
      "Du lịch và khám phá",
      "Nghệ thuật và nhiếp ảnh",
      "Sức khỏe và thể hình",
      "Triết học",
      "Tôn giáo và tâm linh",
      "Ngoại ngữ và ngôn ngữ học",
      "Từ điển và bách khoa",
      "Chính trị và pháp luật",
      "Nông nghiệp và môi trường",
    ],
  },
  {
    name: "Tư liệu và sách cổ",
    items: [
      "Hán Nôm và cổ văn",
      "Địa chí và văn hóa",
      "Khảo cổ và di sản",
      "Bản đồ và địa lý",
      "Báo chí và tạp chí",
      "Thư mục và nghiên cứu sách",
    ],
  },
  {
    name: "Đối tượng độc giả",
    items: [
      "Sách thiếu nhi",
      "Tuổi mới lớn (8–12 tuổi)",
      "Thanh thiếu niên (12–18 tuổi)",
      "Sách dành cho người lớn",
    ],
  },
];
export function createFixtures(): DemoState {
  const now = Date.now(),
    at = (offset: number) => new Date(now + offset).toISOString();
  const values: [string, string, number, string, string][] = [
    ["Vang Bóng Một Thời", "Nguyễn Tuân", 1940, "Văn học cổ điển", "6200000"],
    ["Truyện Kiều", "Nguyễn Du", 1925, "Hán Nôm và cổ văn", "8750000"],
    ["Số Đỏ", "Vũ Trọng Phụng", 1938, "Văn học cổ điển", "3500000"],
    ["Thi Nhân Việt Nam", "Hoài Thanh · Hoài Chân", 1942, "Thơ ca", "2800000"],
    ["Dế Mèn Phiêu Lưu Ký", "Tô Hoài", 1954, "Sách thiếu nhi", "4800000"],
    [
      "Đại Nam Quốc Sử Diễn Ca",
      "Lê Ngô Cát · Phạm Đình Toái",
      1930,
      "Lịch sử",
      "1500000",
    ],
    [
      "Việt Nam Văn Hóa Sử Cương",
      "Đào Duy Anh",
      1938,
      "Địa chí và văn hóa",
      "3200000",
    ],
    [
      "Đông Dương Tạp Chí",
      "Nhiều tác giả",
      1915,
      "Báo chí và tạp chí",
      "2000000",
    ],
    [
      "Từ điển Việt – Bồ – La",
      "Alexandre de Rhodes",
      1991,
      "Từ điển và bách khoa",
      "1800000",
    ],
    ["Lều Chõng", "Ngô Tất Tố", 1941, "Văn học cổ điển", "4100000"],
  ];
  const auctions: Auction[] = values.map(
    ([title, author, year, genre, price], index) => {
      const id = 101 + index;
      const status =
        index === 6
          ? "cho_kiem_duyet"
          : index === 7
            ? "tu_choi"
            : index === 8
              ? "da_qua_kiem_duyet"
              : [4, 5].includes(index)
                ? "da_ket_thuc"
                : "da_kich_hoat";
      return {
        id,
        bookId: 201 + index,
        postId: 401 + index,
        title,
        postTitle: title,
        author,
        year,
        genre,
        publisher: "Thông tin ấn bản do người đăng cung cấp",
        isbn: "",
        sellerId: [1, 3, 9].includes(index) ? 3 : 1,
        cover: `/covers/book-${index + 1}.svg`,
        description:
          "Một bản sách dành cho người yêu văn chương và những câu chuyện của thời gian. Thông tin xuất bản trong bản xem trước là dữ liệu minh họa, cần đối chiếu với bản sách thực tế.",
        condition:
          "Bìa có dấu thời gian, một số trang ngả màu nhẹ. Chưa đủ ảnh để xác nhận toàn bộ liên kết và tình trạng từng trang.",
        evidence:
          "Người đăng cung cấp mô tả ấn bản và ảnh trang xuất bản để Admin kiểm tra. Chưa xác minh chữ ký, nguồn gốc hoặc số bản còn lại.",
        media: [],
        startPrice: price,
        currentPrice: [2, 5, 6, 7, 8].includes(index) ? null : price,
        step: "50000",
        cooldown: 20,
        startAt: ["cho_kiem_duyet", "tu_choi", "da_qua_kiem_duyet"].includes(
          status,
        )
          ? null
          : at(index === 2 ? 3600000 : -7200000),
        endAt:
          status === "da_ket_thuc"
            ? at(-3600000)
            : at(index === 1 ? 2100000 : index === 9 ? 86400000 : 8100000),
        status,
        bids: [2, 5, 6, 7, 8].includes(index)
          ? []
          : [
              {
                id: `seed-${id}`,
                userId: index === 4 ? 2 : 3,
                amount: price,
                at: at(-300000),
              },
            ],
        comments:
          id === 101
            ? [
                {
                  id: "c1",
                  userId: 3,
                  name: "Trần Hoài",
                  text: "Mong được xem thêm ảnh trang xuất bản và phần gáy sách.",
                  at: at(-600000),
                },
              ]
            : [],
        outcome:
          index === 4
            ? { winnerId: 2, amount: price, reason: "het_thoi_gian" }
            : index === 5
              ? { winnerId: null, amount: null, reason: "het_thoi_gian" }
              : null,
        ...(index === 7
          ? {
              rejection:
                "Ảnh trang xuất bản chưa đủ rõ. Vui lòng bổ sung ảnh và căn cứ về yếu tố quý hiếm.",
            }
          : {}),
      };
    },
  );
  return {
    viewer: "guest",
    auctions,
    privatePrices: Object.fromEntries(
      auctions.map((a) => [a.id, String(BigInt(a.startPrice) + 3000000n)]),
    ),
    analyses: {
      107: {
        state: "partial",
        rare: 75,
        condition: null,
        rarity: demoRarity,
        physical: demoPhysical,
        warnings: [
          "Chưa có ảnh rõ gáy và liên kết.",
          "Chữ ký quan sát được không chứng minh chữ ký thật.",
        ],
        at: at(-1800000),
        model: "Gemini · dữ liệu mẫu",
        version: "book-review-2026-10-v1",
      },
    },
    trades: [
      {
        id: 301,
        code: "GD-MH-0301",
        auctionId: 105,
        buyerId: 2,
        sellerId: 1,
        amount: "4800000",
        buyerConfirmedAt: null,
        sellerConfirmedAt: null,
        completedAt: null,
        roomOpen: true,
        messages: [
          {
            id: "m1",
            senderId: 1,
            text: "Chào bạn, cảm ơn bạn đã tham gia phiên đấu giá. Chúng ta trao đổi việc nhận sách tại đây nhé.",
            at: at(-2400000),
            read: true,
          },
          {
            id: "m2",
            senderId: 2,
            text: "Cảm ơn anh. Anh cho em biết tình trạng phần gáy trước khi nhận sách nhé.",
            at: at(-1800000),
            read: true,
          },
        ],
        rating: null,
      },
    ],
    complaints: [
      {
        id: 501,
        tradeId: 301,
        authorId: 2,
        reason: "Đối chiếu tình trạng sách",
        text: "Tôi muốn đối chiếu vết ố ở mép giấy với mô tả trong bài đăng. Nhờ Admin xem trao đổi và các thông tin liên quan.",
        media: [],
        status: "cho_xu_ly",
        adminId: null,
        reply: null,
        at: at(-900000),
        resolvedAt: null,
      },
    ],
    receipts: {},
    connection: "online",
    resultMode: "accept",
  };
}
