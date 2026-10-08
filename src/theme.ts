// ============================================================
// デザインテーマ
// 「自然」「安心」「成長」「家族」を感じる、白〜ベージュ＋深緑の配色
// ============================================================

export const colors = {
  /** 画面背景（薄いベージュ） */
  background: "#F7F3E9",
  /** カード背景 */
  card: "#FFFFFF",
  /** メインカラー（深い緑） */
  primary: "#2E7D32",
  /** さらに深い緑（見出し・ボタン文字） */
  primaryDark: "#1B5E20",
  /** 明るい緑（補助・成長表現） */
  accent: "#66BB6A",
  /** 薄い緑（背景パネル・トラック） */
  soft: "#E8F1E4",
  /** 見出し文字 */
  text: "#2F3E32",
  /** 補助文字 */
  textMuted: "#6B7A6E",
  /** 罫線 */
  border: "#E2E8DC",
  /** 危険・エラー */
  danger: "#C62828",
  /** 土 */
  soil: "#8D6E63",
  /** 土（明るめ） */
  soilLight: "#BCAAA4",
  /** 花 */
  flower: "#F48FB1",
  /** 花の中心 */
  flowerCore: "#FFD54F",
  /** 白 */
  white: "#FFFFFF",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** 祖父母世代も押しやすい大きさに統一 */
export const buttonHeight = 54;
