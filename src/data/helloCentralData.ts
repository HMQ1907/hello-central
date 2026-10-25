export interface MenuItem {
  name: string;
  price: string;
  unit?: string;
  spicy?: boolean;
  veg?: boolean;
  bestSeller?: boolean;
  note?: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  items: MenuItem[];
}

export interface SignatureDish {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  price: string;
  description: string;
  image: string;
  accentColor: string;
  stickerText: string;
}

export interface PromoCard {
  id: string;
  badge: string;
  title: string;
  condition: string;
  description: string;
  image: string;
  highlight: string;
}

export interface SpaceGalleryItem {
  id: string;
  category: 'khong-gian' | 'khoanh-khac' | 'am-thuc';
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  aspect: 'portrait' | 'landscape' | 'square';
  badge: string;
}

export const BRAND_INFO = {
  name: 'HELLO CENTRAL',
  subName: 'DĨ AN • BÌNH DƯƠNG',
  tagline: 'Mồi Bén • Bia Tươi • Nhạc Xập Xình • Chill Hết Nấc',
  heroQuote: 'Say Hello! Don’t Worry, Beer Happy.',
  description:
    'Không gian ăn uống và giải trí về đêm giữa lòng Dĩ An, TP. Hồ Chí Minh – ngay cạnh GO! Dĩ An.',
  openHours: '17:00 – 23:59 (Mở cửa mỗi ngày)',
  address: '99GS1, Phường Đông Hòa, TP. Dĩ An, Bình Dương (Gần GO! Dĩ An)',
  hotline1: '084 663 9279',
  hotline1Raw: '0846639279',
  hotline2: '088 693 9279',
  hotline2Raw: '0886939279',
  zaloUrl: 'https://zalo.me/0846639279',
  fanpageUrl: 'https://www.facebook.com/Hellocentraldian?locale=vi_VN',
  mapsUrl: 'https://maps.app.goo.gl/GCtYDT8Vii7CBGVA6',
};

export const MARQUEE_PRIMARY = [
  'HELLO CENTRAL DĨ AN',
  'DON’T WORRY BEER HAPPY',
  'DJ XẬP XÌNH • DÂN CHƠI DĨ AN',
  'DZÔ!!! RIGHT WAY',
  'MỒI BÉN • BIA TƯƠI • LẨU MALA CAY TÊ',
  '99GS1 ĐÔNG HÒA (GẦN GO! DĨ AN)',
  'SAY HELLO ◡·◡',
];

export const MARQUEE_SECONDARY = [
  'TẶNG CANH CÁ TỨ XUYÊN KHI ĐẶT BÀN TRƯỚC',
  'TẶNG 1 THÁP SOJU CHO NHÓM 6 NỮ NGOAN XINH YÊU',
  'GÀ NƯỚNG TÂY BẮC • XÔI CUA • NACHOS BOLOGNESE',
  'THÁP BIA TUBORG • 1664 BLANC • CARLSBERG • SOJU JINRO',
  'HOTLINE ĐẶT BÀN: 084 663 9279 – 088 693 9279',
];

export const SIGNATURE_DISHES: SignatureDish[] = [
  {
    id: 'lau-mala',
    title: 'Lẩu Mala Chuẩn Vị',
    subtitle: 'Cay! Tê!! Đậm Đà Chuẩn Bài',
    tag: 'BEST SELLER MÙA TỤ TẬP',
    price: 'Từ 159.000đ',
    description:
      'Nước dùng Mala đỏ au thơm nồng hoa tiêu Tứ Xuyên, nhúng kèm bò Mỹ, hải sản tươi, nấm kim châm và đậu hũ non. Húp một muỗng là ấm bụng, chạm ly bia lạnh là hết nước chấm!',
    image: '/assets/dish-lau-mala.jpg',
    accentColor: '#FF451E',
    stickerText: 'CAY! TÊ!!',
  },
  {
    id: 'ga-nuong-tay-bac',
    title: 'Gà Nướng Tây Bắc',
    subtitle: 'Chuẩn Mồi Nhắm • Đủ Chất Chill',
    tag: 'MỒI BÉN ĐỈNH CAO',
    price: 'Signature',
    description:
      'Gà nguyên con ướp mắc khén hạt dổi nướng da giòn óng ả, dọn kèm xôi chiên phồng vàng ruộm, kim chi cải thảo và muối chấm chẩm chéo chua cay tê đầu lưỡi.',
    image: '/assets/dish-ga-nuong.jpg',
    accentColor: '#FFB800',
    stickerText: 'MỒI BÉN!',
  },
  {
    id: 'xoi-cua',
    title: 'Xôi Cua Hello Central',
    subtitle: 'Best Choice Cho Food Boy & Food Girl!',
    tag: 'CHẮC BỤNG BỀN KÈO',
    price: 'Signature',
    description:
      'Cua biển tươi chắc thịt quyện sốt đậm đà phủ trên lớp xôi nếp dẻo thơm hành phi, mỡ hành óng ánh. Món chính vừa lên hình cực nghệ vừa giúp hội bạn trụ vững tới cuối cuộc vui.',
    image: '/assets/dish-xoi-cua.jpg',
    accentColor: '#FF1E27',
    stickerText: 'BEST CHOICE!',
  },
  {
    id: 'nachos-bolognese',
    title: 'Nachos Bolognese',
    subtitle: 'Giòn Rụm • Sốt Bò Bằm Phô Mai Kéo Sợi',
    tag: 'LAI RAI CỰC CHILL',
    price: 'Signature',
    description:
      'Bánh bắp tortilla giòn tan phủ đẫm sốt bò bằm Bolognese kiểu Ý và phô mai béo ngậy. Món khai vị lai rai hoàn hảo cùng tháp bia 1664 Blanc hoặc Soju trái cây.',
    image: '/assets/dish-nachos.jpg',
    accentColor: '#1A7F37',
    stickerText: 'CHILL VIBES',
  },
];

export const PROMO_CARDS: PromoCard[] = [
  {
    id: 'promo-canh-ca',
    badge: 'ĐẶT BÀN TRƯỚC QUA FANPAGE',
    title: 'TẶNG NGAY CANH CÁ TỨ XUYÊN',
    condition: 'Áp dụng cho bàn đặt trước qua Fanpage / Zalo Hello Central',
    description:
      'Chỉ cần nhắn tin đặt bàn trước khi lên đồ, bàn của bạn được tặng liền tay 01 thố Canh Cá Tứ Xuyên nóng hổi trị giá 139.000đ chua cay tê tái.',
    image: '/assets/promo-canh-ca.jpg',
    highlight: 'Trị giá 139K',
  },
  {
    id: 'promo-thap-soju',
    badge: 'ĐẶC QUYỀN HỘI CHỊ EM',
    title: 'TẶNG 01 THÁP SOJU CỰC CHÁY',
    condition: 'Nhóm 6 "Ngoan Xinh Yêu" • Áp dụng cho bàn từ 6 khách nữ',
    description:
      'Lên đồ đi chill cùng hội chị em! Bàn từ 6 khách nữ nhận ngay 01 Tháp Rượu Soju mix vị (Yakult / Ocean / Hawaii / Love Story) trị giá 189.000đ.',
    image: '/assets/promo-thap-soju.jpg',
    highlight: 'Trị giá 189K',
  },
  {
    id: 'promo-trung-long-dao',
    badge: 'DEAL MỒI NHẮM CỰC CUỐN',
    title: 'TẶNG TRỨNG LÒNG ĐÀO TẮM ME',
    condition: 'Áp dụng khi đặt bàn trước qua Fanpage Hello Central',
    description:
      'Trứng lòng đào béo mịn quyện sốt me chua ngọt đậm đà rắc đậu phộng giòn tan và hành phi thơm lừng — món khai vị bắt bia số 1 tại quán.',
    image: '/assets/promo-trung-long-dao.jpg',
    highlight: 'Khai Vị Nổi Bật',
  },
];

export const SPACE_GALLERY: SpaceGalleryItem[] = [
  {
    id: 'neon-pathway',
    category: 'khong-gian',
    categoryLabel: 'Không Gian & Kiến Trúc',
    title: 'Cung Đường Gạch LED Vàng Ấm & Biển Neon "hello?"',
    subtitle: 'Góc check-in thương hiệu không thể nhầm lẫn tại Đông Hòa',
    description:
      'Lối đi gạch uốn lượn được viền dải đèn LED vàng ấm dẫn thẳng vào khu vườn nhiệt đới mở, nổi bật dưới ánh đèn neon đỏ rực rỡ giữa màn đêm Dĩ An.',
    image: '/assets/space-neon-pathway.jpg',
    aspect: 'portrait',
    badge: 'SIGNATURE CHECK-IN',
  },
  {
    id: 'crowd-vibe',
    category: 'khoanh-khac',
    categoryLabel: 'Khoảnh Khắc & Nhịp Đập',
    title: 'Sân Vườn Thoáng Đãng • DJ Xập Xình Mỗi Tối',
    subtitle: 'Nơi hàng trăm thực khách nâng ly dưới bức tường "Say hello"',
    description:
      'Không gian ngoài trời rộng rãi dưới tán cây xanh, hệ thống âm thanh ánh sáng hiện đại, cực kỳ lý tưởng cho tiệc sinh nhật, liên hoan công ty và hội bạn thân.',
    image: '/assets/space-crowd-vibe.jpg',
    aspect: 'portrait',
    badge: 'FULL BÀN MỖI TỐI',
  },
  {
    id: 'cheers-table',
    category: 'am-thuc',
    categoryLabel: 'Trải Nghiệm Bàn Tiệc',
    title: 'Bia Lạnh Tràn Ly • Mồi Nóng Lên Đều Tay',
    subtitle: 'Chạm ly Tuborg mát lạnh bên nồi lẩu nghi ngút khói',
    description:
      'Từ những ly bia tươi phủ sương lạnh buốt đến bàn tiệc đầy ắp lẩu, nướng và gỏi trộn — mỗi cuộc hẹn tại Hello Central đều trọn vẹn hương vị lẫn cảm xúc.',
    image: '/assets/space-cheers-table.jpg',
    aspect: 'portrait',
    badge: 'DZÔ 100%!',
  },
  {
    id: 'neon-night',
    category: 'khong-gian',
    categoryLabel: 'Tọa Độ Đêm Dĩ An',
    title: 'Don’t Worry, Beer Happy',
    subtitle: 'Tín hiệu đèn xanh cho mọi cuộc vui sau giờ làm',
    description:
      'Bỏ lại mọi deadline phía sau cánh cổng đèn neon. Chỉ cần rẽ đúng làn "RIGHT WAY" về 99GS1 Đông Hòa là có ngay một đêm xả stress đúng điệu.',
    image: '/assets/space-neon-night.jpg',
    aspect: 'portrait',
    badge: 'NIGHTLIFE VIBE',
  },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'moi-vao-keo',
    title: 'Mồi Vào Kèo',
    subtitle: 'Lai rai khai cuộc • Giòn rụm bắt bia ngay từ ngụm đầu tiên',
    badge: 'KHAI VỊ BẮT BIA',
    items: [
      { name: 'Khoai tây chiên bơ đường', price: '49.000', unit: 'Phần', veg: true },
      { name: 'Khoai tây chiên cocktail', price: '59.000', unit: 'Phần' },
      { name: 'Đậu hũ chiên giòn', price: '59.000', unit: 'Phần', veg: true },
      { name: 'Trứng lòng đào tắm me', price: '69.000', unit: 'Phần', bestSeller: true, note: 'Khai vị nổi bật' },
      { name: 'Cánh gà chiên sả', price: '89.000', unit: 'Phần' },
      { name: 'Cánh gà tắm me cay', price: '89.000', unit: 'Phần', spicy: true },
      { name: 'Đậu hũ chà bông mỡ hành', price: '89.000', unit: 'Phần', bestSeller: true },
      { name: 'Tôm chiên xù', price: '99.000', unit: 'Phần' },
      { name: 'Mực chiên xù', price: '99.000', unit: 'Phần' },
      { name: 'Sụn gà xào cay', price: '99.000', unit: 'Phần', spicy: true },
      { name: 'Tôm tắm me cay', price: '99.000', unit: 'Phần', spicy: true },
      { name: 'Cánh gà chiên mắm', price: '109.000', unit: 'Phần', bestSeller: true },
      { name: 'Sụn gà chiên mắm', price: '129.000', unit: 'Phần', bestSeller: true },
    ],
  },
  {
    id: 'nuong-toi-ben',
    title: 'Nướng Tới Bến',
    subtitle: 'Than hồng thơm phức • Ướp đậm vị Tomyum & Tây Bắc',
    badge: 'THƠM LỪNG THAN HỒNG',
    items: [
      { name: 'Gà nướng Tây Bắc & Xôi phồng', price: 'Signature', unit: 'Mẹt', bestSeller: true, note: 'Đặc sản Hello Central' },
      { name: 'Cà tím mỡ hành', price: '59.000', unit: 'Phần', veg: true },
      { name: 'Xiên heo nướng', price: '69.000', unit: 'Phần' },
      { name: 'Nọng heo nướng', price: '119.000', unit: 'Phần', bestSeller: true },
      { name: 'Thịt bò nướng', price: '119.000', unit: 'Phần' },
      { name: 'Tôm nướng Tomyum', price: '119.000', unit: 'Phần', spicy: true },
      { name: 'Cánh gà nướng Tomyum', price: '119.000', unit: 'Phần', spicy: true },
      { name: 'Mực nướng Tomyum', price: '149.000', unit: 'Phần', spicy: true, bestSeller: true },
    ],
  },
  {
    id: 'goi-tron',
    title: 'Gỏi Trộn Tới Bờ',
    subtitle: 'Chua cay giòn sần sật • Chống ngấy cực đỉnh cho bàn nhậu',
    badge: 'CHUA CAY BÙNG VỊ',
    items: [
      { name: 'Gỏi xoài', price: '59.000', unit: 'Phần', spicy: true },
      { name: 'Gỏi đu đủ sốt Thái', price: '59.000', unit: 'Phần', spicy: true },
      { name: 'Gỏi đu đủ hải sản', price: '99.000', unit: 'Phần', spicy: true, bestSeller: true },
      { name: 'Gỏi xoài hải sản', price: '99.000', unit: 'Phần', spicy: true },
      { name: 'Salad trứng cá chuồn', price: '99.000', unit: 'Phần', bestSeller: true },
      { name: 'Gỏi xoài cá trê giòn', price: '109.000', unit: 'Phần', spicy: true, bestSeller: true },
    ],
  },
  {
    id: 'soup-lau',
    title: 'Ấm Bụng Soup & Lẩu',
    subtitle: 'Lẩu Mala Cay Tê • Canh Cá Tứ Xuyên • Soup Sườn Tomyum',
    badge: 'NÓNG HỔI HÍT HÀ',
    items: [
      { name: 'Lẩu Mala Chuẩn Vị Cay Tê', price: 'Signature', unit: 'Nồi', spicy: true, bestSeller: true, note: 'Best Seller tại quán' },
      { name: 'Nghêu hấp Tomyum', price: '99.000', unit: 'Thố', spicy: true },
      { name: 'Canh cá Tứ Xuyên', price: '139.000', unit: 'Thố', spicy: true, bestSeller: true, note: 'Tặng khi đặt bàn trước' },
      { name: 'Soup Tomyum', price: '149.000', unit: 'Thố', spicy: true },
      { name: 'Soup Tomyum hải sản', price: '159.000', unit: 'Thố', spicy: true, bestSeller: true },
      { name: 'Soup Tomyum bò nấm', price: '159.000', unit: 'Thố', spicy: true },
      { name: 'Soup sườn cay', price: '239.000', unit: 'Thố lớn', spicy: true, bestSeller: true },
      { name: 'Soup sườn Tomyum', price: '259.000', unit: 'Thố lớn', spicy: true },
    ],
  },
  {
    id: 'an-chac-uong-ben',
    title: 'Ăn Chắc Uống Bền & Rau',
    subtitle: 'Cơm chiên, Mì Phúc Kiến, Bò cháy tỏi & Rau rừng xanh mướt',
    badge: 'CHẮC BỤNG TRỤ KÈO',
    items: [
      { name: 'Xôi Cua Hello Central', price: 'Signature', unit: 'Phần', bestSeller: true, note: 'Best Choice Cho Food Boy' },
      { name: 'Nachos Bolognese phô mai', price: 'Signature', unit: 'Phần', bestSeller: true },
      { name: 'Rau rừng luộc', price: '59.000', unit: 'Đĩa', veg: true },
      { name: 'Rau rừng xào tỏi', price: '69.000', unit: 'Đĩa', veg: true },
      { name: 'Cải Hongkong sốt dầu hào / xào tỏi', price: '69.000', unit: 'Đĩa', veg: true },
      { name: 'Cơm chiên tỏi trứng', price: '79.000', unit: 'Thố', veg: true },
      { name: 'Rau rừng xào bò', price: '99.000', unit: 'Đĩa' },
      { name: 'Cơm chiên hải sản', price: '99.000', unit: 'Phần', bestSeller: true },
      { name: 'Mì Phúc Kiến chay', price: '99.000', unit: 'Đĩa', veg: true },
      { name: 'Đậu hũ Tứ Xuyên', price: '99.000', unit: 'Thố', spicy: true },
      { name: 'Cà tím xào thịt bằm', price: '99.000', unit: 'Thố', spicy: true },
      { name: 'Cơm chiên phỉ thúy', price: '119.000', unit: 'Phần' },
      { name: 'Bò cháy tiêu xanh', price: '129.000', unit: 'Phần', spicy: true, bestSeller: true },
      { name: 'Bò cháy tỏi', price: '129.000', unit: 'Phần', bestSeller: true },
      { name: 'Hủ tiếu xào bò / Mì Phúc Kiến bò', price: '139.000', unit: 'Đĩa' },
      { name: 'Mì Phúc Kiến xào hải sản', price: '149.000', unit: 'Đĩa', bestSeller: true },
    ],
  },
  {
    id: 'len-men-da-khat',
    title: 'Lên Men & Ún Đã Khát',
    subtitle: 'Bia chai, Bia ly 420ml, Tháp Bia 3L, Tháp Soju & Trà Nhiệt Đới',
    badge: 'CHẠM LY TỚI BẾN',
    items: [
      { name: 'Bia Huda (Chai / Ly 420ml)', price: '18.000 / 29.000', unit: 'Chai / Ly' },
      { name: 'Bia Tiger Nâu (Chai / Ly 420ml)', price: '22.000 / 39.000', unit: 'Chai / Ly' },
      { name: 'Tuborg / Ken Lùn / Tiger Bạc', price: '24.000 / 49.000', unit: 'Chai / Ly', bestSeller: true },
      { name: '1664 Blanc / Carlsberg', price: '26.000', unit: 'Chai', bestSeller: true },
      { name: 'Soju Jinro (Dưa lưới / Nho / Đào)', price: '79.000', unit: 'Chai' },
      { name: 'Rượu mơ 500ml', price: '90.000', unit: 'Chai' },
      { name: 'Tháp Rượu Soju (Yakult / Ocean / Hawaii / Love Story)', price: '189.000', unit: 'Tháp', bestSeller: true, note: 'Tặng cho bàn 6 nữ' },
      { name: 'Tháp Bia Huda 3L', price: '219.000', unit: 'Tháp 3L' },
      { name: 'Tháp Bia Tuborg 3L', price: '269.000', unit: 'Tháp 3L', bestSeller: true },
      { name: 'Tháp Bia 1664 Blanc / Carlsberg 3L', price: '329.000', unit: 'Tháp 3L', bestSeller: true },
      { name: 'Trà xoài / Trà trái cây nhiệt đới / Trà Thái xanh-đỏ', price: '35.000', unit: 'Ly' },
      { name: 'Nước suối / Coca / Sting / Sprite', price: '15.000 – 20.000', unit: 'Chai/Lon' },
    ],
  },
];
