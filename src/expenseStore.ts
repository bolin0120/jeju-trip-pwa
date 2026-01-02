import type { Expense } from "./settle";

const KEY = "jeju_expenses_v1";

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenses(items: Expense[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}
