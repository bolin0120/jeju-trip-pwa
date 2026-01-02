import { useEffect, useMemo, useState, type ReactNode } from "react";
import "./App.css";

import { JEJU_DAYS, naverUrl, type TripCard } from "./data";

import { PEOPLE } from "./people";
import type { Person } from "./people";

import { computeBalances, settleDebts } from "./settle";
import type { Expense } from "./settle";

import { loadExpenses, saveExpenses } from "./expenseStore";


/* ======================
   App
====================== */
export default function App() {
  const [tab, setTab] = useState<"ITINERARY" | "TOOLS">("ITINERARY");
  const [customCards, setCustomCards] = useState<CustomCard[]>(() => loadCustomCards());
  useEffect(() => saveCustomCards(customCards), [customCards]);
  const [editingCustom, setEditingCustom] = useState<CustomCard | null>(null);

  const [day, setDay] = useState(1);
  const [selected, setSelected] = useState<TripCard | null>(null);
  const [wxNow, setWxNow] = useState("天氣載入中…");
  const [wxRange, setWxRange] = useState(" ");

  const plan = JEJU_DAYS.find((d) => d.day === day)!;
  const mergedCards = useMemo(() => {
    const mine = customCards
      .filter((c) => c.day === plan.day)
      .map(
        (c) =>
          ({
            id: c.id,
            type: c.type,
            start: c.start,
            durationMin: c.durationMin,
            title: c.title,
            place: c.place,
            navQuery: c.navQuery,
            note: c.note,
            tags: ["自訂"],
          }) as TripCard
      );

    return sortCardsForTimeline([...plan.cards, ...mine]);
  }, [customCards, plan.day, plan.cards]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      const a = plan.weatherAnchor; // 來自 data.ts：{ name, lat, lon }

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${a.lat}&longitude=${a.lon}` +
          `&current_weather=true` +
          `&daily=temperature_2m_max,temperature_2m_min` +
          `&timezone=Asia%2FSeoul`;

        const res = await fetch(url);
        const json = await res.json();
        if (cancelled) return;

        const cw = json?.current_weather;
        if (cw) {
          setWxNow(
            `${a.name} · 現在 ${Math.round(cw.temperature)}°C · 風 ${Math.round(
              cw.windspeed
            )} km/h`
          );
        } else {
          setWxNow(`${a.name} · 無即時天氣資料`);
        }

        const tMax = json?.daily?.temperature_2m_max?.[0];
        const tMin = json?.daily?.temperature_2m_min?.[0];

        if (typeof tMax === "number" && typeof tMin === "number") {
          setWxRange(`今日 ${Math.round(tMin)}°C – ${Math.round(tMax)}°C`);
        } else {
          setWxRange(" ");
        }
      } catch {
        if (cancelled) return;
        setWxNow(`${a.name} · 天氣取得失敗（檢查網路）`);
        setWxRange(" ");
      }
    }
  
    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [plan.weatherAnchor.lat, plan.weatherAnchor.lon]);
  function addQuickCustomCard() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    setCustomCards((prev) => [
      {
        id: crypto.randomUUID(),
        day,
        type: "SPOT",
        start: `${hh}:${mm}`,
        durationMin: 60,
        title: "自訂行程",
        note: "點擊可編輯",
        createdAt: Date.now(),
      },
      ...prev,
    ]);

   
  }

  return (
    <div className="app">
      <header className="top">
        <div className="title">濟州旅遊小工具</div>
        <div className="sub">暖米白 · 手機優先 · 自駕導航</div>
      </header>

      <main className="content">
        {tab === "ITINERARY" ? (
          <>
            {/* Day Header */}
            <section className="card">
              <div className="rowBetween">
                <div>
                  <div className="cardTitle">Day {plan.day}</div>
                  <div className="cardText">
                    {plan.date} · {plan.title}
                  </div>
                  <div className="cardText">{wxNow}</div>
                  <div className="cardText muted">{wxRange}</div>
                </div>
                <div className="miniPill">行程</div>
              </div>

              <div className="dayTabs">
                {JEJU_DAYS.map((d) => (
                  <button
                    key={d.day}
                    className={`dayTab ${d.day === day ? "active" : ""}`}
                    onClick={() => setDay(d.day)}
                    type="button"
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>
            </section>

            {/* Hero */}
            {plan.heroImage && (
              <div className="dayHero">
                <img
                  src={`${import.meta.env.BASE_URL}${plan.heroImage.replace(
                    /^\//,
                    ""
                  )}`}
                  alt={`Day ${plan.day}`}
                />
                <div className="heroOverlay">
                  <div className="heroDay">DAY {plan.day}</div>
                  <div className="heroTitle">{plan.title}</div>
                  <div className="heroDate">{plan.date}</div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <Timeline
              items={mergedCards}
              onSelect={(c) => {
                if (c.tags?.includes("自訂")) {
                  const raw = customCards.find((x) => x.id === c.id);
                  if (raw) setEditingCustom(raw);
                } else {
                  setSelected(c);
                }
              }}
            />

          </>
        ) : (
          <Tools />
        )}
      </main>
      {tab === "ITINERARY" && (
        <button
          className="fab"
          type="button"
          onClick={addQuickCustomCard}
        >
          ＋
        </button>

      )}

      {/* Bottom Sheet */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <CardDetail c={selected} />}
      </BottomSheet>
      <BottomSheet open={!!editingCustom} onClose={() => setEditingCustom(null)}>
        {editingCustom && (
          <EditCustomCard
            card={editingCustom}
            onSave={(next) => {
              setCustomCards((prev) =>
                prev.map((c) => (c.id === next.id ? next : c))
              );
              setEditingCustom(null);
            }}
            onDelete={(id) => {
              setCustomCards((prev) => prev.filter((c) => c.id !== id));
              setEditingCustom(null);
            }}
          />
        )}
      </BottomSheet>

      <nav className="tabbar">
        <button
          className={`tabBtn ${tab === "ITINERARY" ? "active" : ""}`}
          onClick={() => setTab("ITINERARY")}
          type="button"
        >
          行程
        </button>
        <button
          className={`tabBtn ${tab === "TOOLS" ? "active" : ""}`}
          onClick={() => setTab("TOOLS")}
          type="button"
        >
          工具
        </button>
      </nav>
    </div>
  );
}

/* ======================
   Timeline helpers
====================== */
function toMinutes(t?: string) {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function addMinutesToTime(start: string, add: number) {
  const m = toMinutes(start);
  if (m === null) return null;
  const end = m + add;
  const hh = Math.floor(end / 60) % 24;
  const mm = end % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function timeBucketLabel(mins: number) {
  if (mins < 11 * 60) return "Morning";
  if (mins < 14 * 60) return "Lunch";
  if (mins < 18 * 60) return "Afternoon";
  return "Evening";
}

function sortCardsForTimeline(cards: TripCard[]) {
  const t = (c: TripCard) =>
    c.start ? toMinutes(c.start) ?? 9999 : 9999;
  return [...cards].sort((a, b) => t(a) - t(b));
}

/* ======================
   Timeline
====================== */
function Timeline({
  items,
  onSelect,
}: {
  items: TripCard[];
  onSelect: (c: TripCard) => void;
}) {
  let lastBucket: string | null = null;

  return (
    <section className="timeline">
      {items.map((c) => {
        const mins = toMinutes(c.start);
        const bucket = mins === null ? "Anytime" : timeBucketLabel(mins);
        const showBucket = bucket !== lastBucket;
        if (showBucket) lastBucket = bucket;
        const isCustom = c.tags?.includes("自訂") ?? false;

        return (
          <div key={c.id}>
            {showBucket && (
              <div className="tlGroup">
                <div className="tlGroupText">{bucket}</div>
              </div>
            )}

            <div className="tlRow">
              <div className="tlTime">
                {c.start ? (
                  <div className="t">
                    {c.durationMin
                      ? `${c.start}–${addMinutesToTime(
                          c.start,
                          c.durationMin
                        )}`
                      : c.start}
                  </div>
                ) : (
                  <div className="t muted">Anytime</div>
                )}
              </div>

              <div className="tlLine">
                <div className={`dot ${c.type.toLowerCase()} ${isCustom ? "custom" : ""}`} />
                <div className="vline" />
              </div>

              <TimelineCard c={c} onSelect={onSelect} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TimelineCard({
  c,
  onSelect,
}: {
  c: TripCard;
  onSelect: (c: TripCard) => void;
}) {
  const nav = c.navQuery ? naverUrl(c.navQuery) : null;

  const highlight =
    c.tags?.some((t) => ["必吃", "必點", "必買", "重點", "提醒"].includes(t)) ??
    false;
  const isCustom = c.tags?.includes("自訂") ?? false;

  return (
      <button
        type="button"
        className={`tlCard tlBtn ${highlight ? "hl" : ""} ${isCustom ? "custom" : ""}`}
        onClick={() => onSelect(c)}
      >

      <div className="tlCardTop">
        <span className={`kind ${c.type.toLowerCase()}`}>{c.type}</span>
        {isCustom && <span className="pill customPill">自訂</span>}

        {c.durationMin && <span className="pill">{c.durationMin} 分</span>}
        {nav && (
          <a
            className="navBtn"
            href={nav}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Naver 導航
          </a>
        )}

      </div>

      <div className="tlTitle">{c.title}</div>
      {c.place && <div className="tlPlace">{c.place}</div>}
      {c.note && <div className="tlNote">{c.note}</div>}
    </button>
  );
}

/* ======================
   Bottom Sheet
====================== */
function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHandle" />
        <button className="sheetClose" onClick={onClose} type="button">
          關閉
        </button>
        {children}
      </div>
    </div>
  );
}

function CardDetail({ c }: { c: TripCard }) {
  const nav = c.navQuery ? naverUrl(c.navQuery) : null;

  return (
    <div className="detail">
      <div className="detailTop">
        <div className="miniPill">{c.type}</div>
        {nav && (
          <a
            className="primarySmall"
            href={nav}
            target="_blank"
            rel="noreferrer"
          >
            導航
          </a>
        )}
      </div>

      <div className="detailTitle">{c.title}</div>
      {c.place && <div className="detailSub">{c.place}</div>}
      {c.note && <div className="detailBody">{c.note}</div>}
    </div>
  );
}

/* ======================
   Tools (Ledger)
====================== */
function Tools() {
  const [me, setMe] = useState<Person>(PEOPLE[0]);
  const [items, setItems] = useState<Expense[]>(() => loadExpenses());
  const [fx, setFx] = useState<number | null>(null); // 1 KRW = ? TWD
  const [fxMode, setFxMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [fxManual, setFxManual] = useState<string>(""); // 手動輸入

  const [fxKrw, setFxKrw] = useState<string>(""); // KRW -> TWD
  const [fxTwd, setFxTwd] = useState<string>(""); // TWD -> KRW

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        // Open Exchange Rates 無 key 很麻煩；我們用 exchangerate.host（免 key，常用）
        const res = await fetch("https://open.er-api.com/v6/latest/KRW");
        const json = await res.json();
        const rate = json?.rates?.TWD;
        if (!ignore && typeof rate === "number" && Number.isFinite(rate)) {
          setFx(rate);
        }
      } catch {
        // 失敗就保持 null（你仍可手動輸入）
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);
  const fxRate = useMemo(() => {
    if (fxMode === "MANUAL") {
      const n = Number(fxManual);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return fx;
  }, [fx, fxMode, fxManual]);

  const fxText =
    fxRate ? `1 KRW ≈ ${fxRate.toFixed(6)} TWD` : "匯率：載入中（可改手動）";

  // 新增表單
  const [currency, setCurrency] = useState<Expense["currency"]>("KRW");
  const [day, setDay] = useState<number | "">("");
  const [payer, setPayer] = useState<Person>(PEOPLE[0]);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [participants, setParticipants] = useState<Record<Person, boolean>>(
    () => Object.fromEntries(PEOPLE.map((p) => [p, true])) as Record<Person, boolean>
  );

  // 儲存到 localStorage
  useEffect(() => {
    saveExpenses(items);
  }, [items]);

  const selectedParticipants = useMemo(
    () => PEOPLE.filter((p) => participants[p]),
    [participants]
  );

  const peopleList = [...PEOPLE];

  const balances = useMemo(
    () => computeBalances(peopleList, items),
    [items]
  );

  const transfersKRW = useMemo(
    () => settleDebts(peopleList, balances.netKRW),
    [balances.netKRW]
  );

  const transfersTWD = useMemo(
    () => settleDebts(peopleList, balances.netTWD),
    [balances.netTWD]
  );

  function toggleParticipant(p: Person) {
    setParticipants((prev) => ({ ...prev, [p]: !prev[p] }));
  }

  function addExpense() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    const parts = selectedParticipants.length ? selectedParticipants : [...PEOPLE];

    const e: Expense = {
      id: crypto.randomUUID(),
      day: day === "" ? undefined : day,
      currency,
      payer,
      amount: n,
      participants: parts as Person[],
      split: "equal",
      note: note.trim() || undefined,
      createdAt: Date.now(),
    };

    setItems((prev) => [e, ...prev]);
    setAmount("");
    setNote("");
    setParticipants(Object.fromEntries(PEOPLE.map((p) => [p, true])) as Record<Person, boolean>);
    setPayer(me);
  }

  function removeExpense(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  const fmt = (n: number) => Math.round(n).toLocaleString();

  return (
    <>
      <section className="card">
        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="cardTitle">匯率計算器</div>
            <div className="cardText" style={{ marginTop: 6 }}>
              {fxText}
            </div>
          </div>

          <div className="seg">
            <button
              type="button"
              className={`segBtn ${fxMode === "AUTO" ? "on" : ""}`}
              onClick={() => setFxMode("AUTO")}
            >
              AUTO
            </button>
            <button
              type="button"
              className={`segBtn ${fxMode === "MANUAL" ? "on" : ""}`}
              onClick={() => setFxMode("MANUAL")}
            >
              手動
            </button>
          </div>
        </div>

        {fxMode === "MANUAL" ? (
          <div style={{ marginTop: 12 }}>
            <div className="label">手動匯率（1 KRW = ? TWD）</div>
            <input
              className="input"
              value={fxManual}
              onChange={(e) => setFxManual(e.target.value)}
              placeholder="例如 0.024"
              inputMode="decimal"
            />
          </div>
        ) : null}

        <div className="fxGrid">
          <div>
            <div className="label">KRW</div>
            <input
              className="input"
              value={fxKrw}
              onChange={(e) => setFxKrw(e.target.value)}
              placeholder="例如 45000"
              inputMode="numeric"
            />
          </div>

          <div className="fxMid">
            <div className="fxArrow">⇄</div>
            <div className="fxHint">一鍵換算</div>
          </div>

          <div>
            <div className="label">TWD</div>
            <input
              className="input"
              value={fxTwd}
              onChange={(e) => setFxTwd(e.target.value)}
              placeholder="例如 1200"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="fxBtns">
          <button
            className="primary"
            type="button"
            onClick={() => {
              const r = fxRate;
              const n = Number(fxKrw);
              if (!r || !Number.isFinite(n)) return;
              setFxTwd(String(Math.round(n * r)));
            }}
          >
            KRW → TWD
          </button>

          <button
            className="ghost"
            type="button"
            onClick={() => {
              const r = fxRate;
              const n = Number(fxTwd);
              if (!r || !Number.isFinite(n)) return;
              setFxKrw(String(Math.round(n / r)));
            }}
          >
            TWD → KRW
          </button>
        </div>

        {fxRate ? (
          <div className="note" style={{ marginTop: 10 }}>
            小提醒：韓國刷卡/換匯可能會有手續費，這裡是純匯率估算。
          </div>
        ) : null}
      </section>


      {/* 航班資訊：依你 PDF 已填好 */}
      <section className="card">
        <div className="cardTitle">航班資訊（已填好）</div>
        <div className="cardText">
          去程：2026/01/06 02:50 桃園T1 → 06:05 濟州（真航空 LJ764）
        </div>
        <div className="cardText">
          回程：2026/01/09 22:15 濟州 → 23:50 桃園T1（真航空 LJ763）
        </div>
        <div className="note">
          訂位代號：去程 B7G4HY／回程 U282DE（同一訂單）。建議：起飛前至少 3 小時到機場。
        </div>
      </section>

      {/* 住宿資訊 */}
      <section className="card">
        <div className="cardTitle">住宿資訊</div>
        <div className="cardText">까델아스리조트（涯月邑）</div>
        <a
          className="ghost"
          href={naverUrl("50 Sineom 9-gil 까델아스리조트 Aewol Jeju")}
          target="_blank"
          rel="noreferrer"
        >
          導航到住宿
        </a>
      </section>

      {/* 緊急聯絡 */}
      <section className="card">
        <div className="cardTitle">緊急聯絡</div>
        <div className="cardText">112（警察） / 119（消防/救護）</div>
        <div className="note">可把租車公司電話、保險單號貼在這裡。</div>
      </section>

      {/* 記帳 / 分帳（離線 localStorage） */}
      <section className="card">
        <div className="rowBetween">
          <div>
            <div className="cardTitle">記帳 / 分帳（離線）</div>
            <div className="cardText">5 人團：誰墊付、誰分攤、結算還錢清單（KRW/TWD 分開算）</div>
          </div>

          <select className="select" value={me} onChange={(e) => setMe(e.target.value as Person)}>
            {PEOPLE.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 新增一筆 */}
        <div className="formGrid">
          <div className="formRow">
            <label className="label">幣別</label>
            <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
              <option value="KRW">KRW</option>
              <option value="TWD">TWD</option>
            </select>
          </div>

          <div className="formRow">
            <label className="label">Day（可空）</label>
            <select
              className="select"
              value={day}
              onChange={(e) => setDay(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">不指定</option>
              <option value="1">Day 1</option>
              <option value="2">Day 2</option>
              <option value="3">Day 3</option>
              <option value="4">Day 4</option>
            </select>
          </div>

          <div className="formRow">
            <label className="label">付款人（誰先墊）</label>
            <select className="select" value={payer} onChange={(e) => setPayer(e.target.value as Person)}>
              {PEOPLE.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="formRow">
            <label className="label">金額</label>
            <input
              className="input"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例如 45000"
            />
          </div>

          <div className="formRowFull">
            <label className="label">分攤人（預設五人平均；可取消某人＝幫他付）</label>
            <div className="chips">
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${participants[p] ? "on" : ""}`}
                  onClick={() => toggleParticipant(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="formRowFull">
            <label className="label">備註</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如 海膽拌飯" />
          </div>

          <div className="formRowFull">
            <button className="primary" type="button" onClick={addExpense}>
              新增
            </button>
          </div>
        </div>

        {/* 清單 */}
        <div className="stack" style={{ marginTop: 14 }}>
          {items.length === 0 ? (
            <div className="note">目前沒有支出。你新增後會自動儲存到 localStorage。</div>
          ) : (
            items.map((x) => (
              <div key={x.id} className="rowBetween miniRow">
                <div>
                  <div className="cardText" style={{ fontWeight: 900 }}>
                    {x.note ?? "（未填備註）"} · {x.currency} {fmt(x.amount)}
                  </div>
                  <div className="note">
                    {x.day ? `Day ${x.day} · ` : ""}
                    付款：{x.payer} · 分攤：{x.participants.join("、")}
                  </div>
                </div>
                <button className="ghost" type="button" onClick={() => removeExpense(x.id)}>
                  刪除
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 結算（誰還誰） */}
      <section className="card">
        <div className="cardTitle">結算（KRW）</div>
        {transfersKRW.length === 0 ? (
          <div className="note">目前 KRW 無需轉帳。</div>
        ) : (
          <div className="stack">
            {transfersKRW.map((t, i) => (
              <div key={i} className="cardText">
                {t.from} → {t.to}：{fmt(t.amount)} KRW
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="cardTitle">結算（TWD）</div>
        {transfersTWD.length === 0 ? (
          <div className="note">目前 TWD 無需轉帳。</div>
        ) : (
          <div className="stack">
            {transfersTWD.map((t, i) => (
              <div key={i} className="cardText">
                {t.from} → {t.to}：{fmt(t.amount)} TWD
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
type CustomCard = {
  id: string;
  day: number;
  type: "SPOT" | "FOOD" | "MOVE";
  start?: string; // "HH:MM"
  durationMin?: number;
  title: string;
  place?: string;
  navQuery?: string;
  note?: string;
  createdAt: number;
};

const CUSTOM_KEY = "jeju_custom_cards_v1";

function loadCustomCards(): CustomCard[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveCustomCards(cards: CustomCard[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(cards));
}
function EditCustomCard({
  card,
  onSave,
  onDelete,
}: {
  card: CustomCard;
  onSave: (c: CustomCard) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [start, setStart] = useState(card.start ?? "");
  const [durationMin, setDurationMin] = useState(
    card.durationMin?.toString() ?? ""
  );
  const [navQuery, setNavQuery] = useState(card.navQuery ?? "");
  const [note, setNote] = useState(card.note ?? "");

  return (
    <div className="detail">
      <div className="detailTop">
        <div className="miniPill">自訂行程</div>
      </div>

      <div className="formGrid">
        <div className="formRowFull">
          <label className="label">標題</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：咖啡廳休息"
          />
        </div>

        <div className="formRow">
          <label className="label">開始時間</label>
          <input
            className="input"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="formRow">
          <label className="label">持續時間（分鐘）</label>
          <input
            className="input"
            inputMode="numeric"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder="例如 60"
          />
        </div>

        <div className="formRowFull">
          <label className="label">Naver 導航地點</label>
          <input
            className="input"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            placeholder="例如：London Bagel Museum Jeju"
          />
        </div>

        <div className="formRowFull">
          <label className="label">備註</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：如果排隊太久就放棄"
          />
        </div>

        <div className="formRowFull">
          <button
            className="primary"
            type="button"
            onClick={() =>
              onSave({
                ...card,
                title: title.trim() || "自訂行程",
                start: start || undefined,
                durationMin: Number(durationMin) || undefined,
                navQuery: navQuery.trim() || undefined,
                note: note.trim() || undefined,
              })
            }
          >
            儲存
          </button>

          <button
            className="danger"
            type="button"
            onClick={() => onDelete(card.id)}
            style={{ marginTop: 8 }}
          >
            刪除這個行程
          </button>
        </div>
      </div>
    </div>
  );
}
