export type CardType = "SPOT" | "FOOD" | "MOVE";
export type TripCard = {
  id: string;
  type: CardType;
  title: string;
  place?: string; // 顯示用
  navQuery?: string; // 有就顯示導航
  start?: string;        // "08:00"
  durationMin?: number;  // 90
  note?: string;
  tags?: Array<"必吃" | "必點" | "必買" | "提醒" | "自訂">;
};

export type DayPlan = {
  day: number;
  title: string;
  date: string; // YYYY-MM-DD
  weatherAnchor: { name: string; lat: number; lon: number };
  heroImage?: string; // 可選：每天一張圖
  cards: TripCard[];
};


export const JEJU_DAYS: DayPlan[] = [
  {
    day: 1,
    date:"2026-01-06",
    heroImage: "/images/day1.png",
    weatherAnchor: { name: "濟州市區", lat: 33.4890, lon: 126.4890 },
    title: "市區修復＋往西線入住",
    cards: [
  {
    id: "d1-1",
    type: "SPOT",
    title: "君悅 Dream Tower 汗蒸幕",
    place: "Jeju Dream Tower",
    navQuery: "Jeju Dream Tower jjimjilbang",
    start: "08:00",
    durationMin: 90,
    note: "適合紅眼班機後放鬆休息的行程，可洗澡、睡眠、補體力。建議停留 1–2 小時，進場後記得留意最後入場與清場時間。",
    tags: ["提醒"],
  },
  {
    id: "d1-2",
    type: "SPOT",
    title: "咸德海水浴場散步",
    place: "咸德海水浴場",
    navQuery: "Hamdeok Beach Jeju",
    start: "10:30",
    durationMin: 60,
    note:
"濟州最有人氣的海灘之一，沙灘細、海色漂亮。天氣好時非常適合散步拍照，冬天風較大，建議穿防風外套。"

  },
  {
    id: "d1-3",
    type: "FOOD",
    title: "倫敦貝果（早午餐）",
    place: "倫敦貝果",
    navQuery: "London Bagel Museum Jeju",
    start: "11:45",
    durationMin: 60,
    note:
"濟州人氣排隊名店，貝果口味多、外酥內Q。熱門時段需排隊，建議外帶或避開正中午。",

    tags: ["必吃"],
  },
  {
    id: "d1-4",
    type: "SPOT",
    title: "月汀里咖啡街（mou moon）＋餅乾",
    place: "月汀里",
    navQuery: "Woljeongri Beach Jeju",
    start: "13:15",
    durationMin: 90,
    note: "咖啡＋mongle 雲朵餅乾（想買就這裡）",
  },
  {
    id: "d1-5",
    type: "SPOT",
    title: "東門市場＋七星街＋保健路夜逛",
    place: "東門市場",
    navQuery: "Dongmun Market Jeju",
    start: "17:30",
    durationMin: 120,
    note:
"濟州市區最大的傳統市場，晚餐、宵夜、伴手禮一次搞定。推薦黑豬肉、炸物與橘子相關甜點。",
    tags: ["必買"],
  },
  {
    id: "d1-6",
    type: "MOVE",
    title: "回住宿（涯月邑 까델아스리조트）",
    place: "까델아스리조트",
    navQuery: "까델아스리조트 Aewol Jeju",
    start: "20:00",
    durationMin: 50,
  },
],

  },
  {
    day: 2,
    date:"2026-01-07",
    heroImage: "/images/day2.png",
    weatherAnchor: { name: "東線（涉地可支）", lat: 33.4240, lon: 126.9275 },
    title: "東線重點：涉地可支＋牛島",
    cards: [
  { id: "d2-1", type: "SPOT", title: "涉地可支", place: "涉地可支", navQuery: "Seopjikoji Jeju", start: "09:30", durationMin: 75 },
  {
    id: "d2-2",
    type: "MOVE",
    title: "前往城山港搭船",
    place: "城山港",
    navQuery: "Seongsan Port Jeju",
    start: "11:00",
    durationMin: 45,
    note:
"搭船前需出示護照。島上可租電動車或腳踏車，環島一圈約 1.5–2 小時。必吃花生冰淇淋，記得預留回程船班時間。",

    tags: ["提醒"],
  },
  {
    id: "d2-3",
    type: "SPOT",
    title: "牛島（租電動車環島）",
    place: "牛島",
    navQuery: "Udo Island Jeju",
    start: "12:00",
    durationMin: 270,
    note: "抓 4–5 小時；風大注意保暖",
    tags: ["提醒"],
  },
  {
    id: "d2-4",
    type: "FOOD",
    title: "hahahohoudo 🍔 或 海女包飯（飯卷）",
    place: "牛島",
    navQuery: "Udo Island Jeju restaurants",
    start: "13:00",
    durationMin: 45,
    tags: ["必吃", "必點"],
    note:
"牛島知名漢堡店，口味偏美式，份量足。熱門時段可能需要排隊，適合當快速午餐。"

  },
  {
    id: "d2-5",
    type: "FOOD",
    title: "花生橘子冰淇淋",
    place: "牛島",
    navQuery: "Udo peanut ice cream",
    start: "15:30",
    durationMin: 20,
    tags: ["必吃"],
  },
  {
    id: "d2-6",
    type: "FOOD",
    title: "晚餐：海膽拌飯",
    place: "西線/市區",
    navQuery: "Jeju uni bibimbap",
    start: "19:00",
    durationMin: 60,
    tags: ["必吃"],
  },
  { id: "d2-7", type: "MOVE", title: "回住宿（涯月邑）", place: "涯月邑", navQuery: "Aewol Jeju", start: "20:30", durationMin: 40 },
],

  },
  {
    day: 3,
    date:"2026-01-08",
    heroImage: "/images/day3.png",
    weatherAnchor: { name: "西線（涯月）", lat: 33.4625, lon: 126.3090 },
    title: "西線咖啡甜點＋狹才夕陽",
    cards: [
  { id: "d3-1", type: "SPOT", title: "涯月邑海岸兜風", place: "涯月邑", navQuery: "Aewol Jeju", start: "10:00", durationMin: 60 },
  { id: "d3-2", type: "SPOT", title: "lazy pump（海邊鋼琴）", place: "涯月邑", navQuery: "Aewol Jeju cafe piano", start: "11:15", durationMin: 45 ,note:
"特色海邊咖啡店，戶外鋼琴是打卡重點。天氣好時很漂亮，風大時建議選室內座位。"
},
  { id: "d3-3", type: "FOOD", title: "Noraba 海鮮麵", place: "涯月邑", navQuery: "Noraba seafood noodles Jeju", start: "12:30", durationMin: 60, tags: ["必吃"] },
  { id: "d3-4", type: "FOOD", title: "haru film（拍照）", place: "西線", navQuery: "haru film Jeju", start: "14:00", durationMin: 45, note: "拍照＋休息" },
  { id: "d3-5", type: "FOOD", title: "tribe 橘子舒芙蕾", place: "西線", navQuery: "tribe tangerine souffle Jeju", start: "15:15", durationMin: 60, tags: ["必吃", "必點"] },
  { id: "d3-6", type: "FOOD", title: "hugely 橘子冰淇淋", place: "西線", navQuery: "hugely tangerine ice cream Jeju", start: "16:30", durationMin: 25, tags: ["必吃"] },
  { id: "d3-7", type: "SPOT", title: "狹才海水浴場（夕陽）", place: "狹才海水浴場", navQuery: "Hyeopjae Beach Jeju", start: "17:20", durationMin: 70, tags: ["提醒"], note: "冬天夕陽較早，提前卡位比較美" },
],

  },
  {
    day: 4,
    date:"2026-01-09",
    heroImage: "/images/day4.png",
    weatherAnchor: { name: "南線（西歸浦）", lat: 33.2442, lon: 126.4127 },
    title: "南線自然景＋市場補貨 → 22:15 回程",
    cards: [
  { id: "d4-1", type: "SPOT", title: "柱狀節理帶", place: "柱狀節理帶", navQuery: "Jusangjeolli Cliff Jeju", start: "10:30", durationMin: 60 },
  { id: "d4-2", type: "SPOT", title: "獨立岩", place: "獨立岩", navQuery: "Oedolgae Rock Jeju", start: "12:00", durationMin: 50 },
  { id: "d4-3", type: "FOOD", title: "偶來市場（午餐＋伴手禮）", place: "偶來市場", navQuery: "Olle Market Seogwipo", start: "13:10", durationMin: 90, tags: ["必買"], note: "午餐在市場解決＋補貨" },
  { id: "d4-4", type: "MOVE", title: "回市區補買（東門市場/保健路）", place: "市區", navQuery: "Dongmun Market Jeju", start: "16:30", durationMin: 90 },
  {
    id: "d4-5",
    type: "MOVE",
    title: "還車 → 機場報到 → 22:15 起飛",
    start: "19:00",
    durationMin: 195,
    note: "建議 19:00 往機場方向走；19:30–20:00 還車；20:00 後進航廈。",
    tags: ["提醒"],
  },
],

  },
];

export function naverUrl(query: string) {
  // Naver Map web search（手機會跳 Naver Map App）
  return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
}

export function googleUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

