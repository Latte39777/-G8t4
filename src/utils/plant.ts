// ============================================================
// 植物の成長ロジック
// 支援額が増える → 達成率が上がる → 植物が成長する
// ============================================================

import { calcPercent } from "./format";

/** 成長ステージ */
export type PlantStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface PlantStageInfo {
  /** 0 = 種, 5 = 完成 */
  stage: PlantStage;
  /** 表示名 */
  label: string;
  /** 文字表示用の絵文字 */
  emoji: string;
  /** そのステージに必要な最低達成率 */
  minPercent: number;
}

export const PLANT_STAGES: PlantStageInfo[] = [
  { stage: 0, label: "種", emoji: "🌰", minPercent: 0 },
  { stage: 1, label: "芽", emoji: "🌱", minPercent: 1 },
  { stage: 2, label: "小さな苗", emoji: "🌿", minPercent: 26 },
  { stage: 3, label: "葉が増える", emoji: "☘️", minPercent: 51 },
  { stage: 4, label: "大きな植物", emoji: "🌳", minPercent: 76 },
  { stage: 5, label: "完成した植物", emoji: "🌸", minPercent: 100 },
];

/** 達成率から植物のステージを求める */
export function getPlantStage(percent: number): PlantStage {
  const p = Math.min(100, Math.max(0, percent));
  if (p >= 100) return 5;
  if (p >= 76) return 4;
  if (p >= 51) return 3;
  if (p >= 26) return 2;
  if (p >= 1) return 1;
  return 0;
}

/** ステージ情報を取得 */
export function getStageInfo(stage: PlantStage): PlantStageInfo {
  return PLANT_STAGES[stage];
}

/** 支援金額からステージ情報を取得 */
export function getPlantStageByAmount(supported: number, price: number): PlantStageInfo {
  return getStageInfo(getPlantStage(calcPercent(supported, price)));
}

/** 目標達成しているか */
export function isGoalReached(supported: number, price: number): boolean {
  return price > 0 && supported >= price;
}
