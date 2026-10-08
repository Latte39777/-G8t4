// ============================================================
// つながる子育て家計簿 — 共通型定義
// ============================================================

/** ユーザーの立場 */
export type UserRole = "parent" | "grandparent";

/** 表示モード（子育て世代 / 祖父母） */
export type AppMode = "parent" | "grandparent";

/** 支援項目のカテゴリー */
export type Category = "学校" | "習いごと" | "生活" | "その他";

export const CATEGORIES: Category[] = ["学校", "習いごと", "生活", "その他"];

/** profiles テーブル */
export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

/** families テーブル */
export interface Family {
  id: string;
  family_code: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

/** family_members テーブルに紐づくメンバー情報 */
export interface FamilyMember {
  user_id: string;
  profile: Pick<Profile, "name" | "role"> | null;
}

/** support_items テーブル */
export interface SupportItem {
  id: string;
  family_id: string;
  created_by: string | null;
  name: string;
  price: number;
  category: Category;
  child_name: string;
  memo: string;
  own_contribution: number;
  supported_amount: number;
  created_at: string;
}

/** support_records テーブル（応援のきろく） */
export interface SupportRecord {
  id: string;
  support_item_id: string;
  supporter_id: string | null;
  amount: number;
  message: string | null;
  created_at: string;
  /** join で付与される支援者名 */
  supporter?: { name: string } | null;
  /** 一覧表示用（join で付与） */
  item?: { name: string } | null;
}
