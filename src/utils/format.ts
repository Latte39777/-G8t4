// ============================================================
// 表示用ユーティリティ
// ============================================================

/** 金額を「¥70,000」のように表示 */
export function formatYen(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return "¥" + safe.toLocaleString("ja-JP");
}

/** 数字を3桁区切りで表示 */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return safe.toLocaleString("ja-JP");
}

/** 達成率（0〜100・小数なし）を計算 */
export function calcPercent(supported: number, price: number): number {
  if (!price || price <= 0) return 0;
  const percent = Math.floor((supported / price) * 100);
  return Math.min(100, Math.max(0, percent));
}

/** 残り金額を計算 */
export function calcRemaining(supported: number, price: number): number {
  return Math.max(0, price - supported);
}

/** 日時を「2026/10/8 14:32」のように表示 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${hh}:${mm}`;
}

/** カンマ区切りの数値入力を数値へ変換 */
export function parseAmount(text: string): number {
  const cleaned = (text || "").replace(/[,\s¥円]/g, "");
  if (!cleaned) return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.floor(value) : 0;
}

/** 数値入力をカンマ区切りの文字列へ整形 */
export function formatAmountInput(value: number): string {
  if (!value) return "";
  return value.toLocaleString("ja-JP");
}
