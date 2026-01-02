import type { Person } from "./people";

export type Expense = {
  id: string;
  day?: number;
  currency: "KRW" | "TWD";
  payer: Person;               // 付款人（誰墊）
  amount: number;
  participants: Person[];       // 分攤人（預設五人）
  split: "equal" | "custom";    // 平均 or 自訂份額
  shares?: Partial<Record<Person, number>>; // custom 時每人分攤金額（同幣別）
  note?: string;
  createdAt: number;
};

export function computeBalances(people: Person[], expenses: Expense[]) {
  const init = Object.fromEntries(people.map(p => [p, 0])) as Record<Person, number>;

  const paidKRW = { ...init }, owedKRW = { ...init };
  const paidTWD = { ...init }, owedTWD = { ...init };

  for (const e of expenses) {
    const paid = e.currency === "KRW" ? paidKRW : paidTWD;
    const owed = e.currency === "KRW" ? owedKRW : owedTWD;

    paid[e.payer] += e.amount;

    if (e.split === "custom" && e.shares) {
      for (const p of e.participants) {
        owed[p] += Number(e.shares[p] ?? 0);
      }
    } else {
      const n = e.participants.length || 1;
      const share = e.amount / n;
      for (const p of e.participants) owed[p] += share;
    }
  }

  const netKRW = Object.fromEntries(people.map(p => [p, round2(paidKRW[p] - owedKRW[p])])) as Record<Person, number>;
  const netTWD = Object.fromEntries(people.map(p => [p, round2(paidTWD[p] - owedTWD[p])])) as Record<Person, number>;

  return { paidKRW, owedKRW, netKRW, paidTWD, owedTWD, netTWD };
}

export function settleDebts(people: Person[], net: Record<Person, number>) {
  const creditors = people
    .map(p => ({ p, amt: net[p] }))
    .filter(x => x.amt > 0.009)
    .sort((a,b) => b.amt - a.amt);

  const debtors = people
    .map(p => ({ p, amt: -net[p] }))
    .filter(x => x.amt > 0.009)
    .sort((a,b) => b.amt - a.amt);

  const transfers: Array<{ from: Person; to: Person; amount: number }> = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i], c = creditors[j];
    const x = Math.min(d.amt, c.amt);
    transfers.push({ from: d.p, to: c.p, amount: round2(x) });

    d.amt = round2(d.amt - x);
    c.amt = round2(c.amt - x);

    if (d.amt <= 0.009) i++;
    if (c.amt <= 0.009) j++;
  }

  return transfers.filter(t => t.amount > 0.009);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
