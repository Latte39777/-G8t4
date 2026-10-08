import { supabase } from "../lib/supabase";
import { Profile, UserRole } from "../types";

// ============================================================
// プロフィール（profiles）
// ============================================================
export const profileService = {
  /** 自分のプロフィールを取得（未作成なら null） */
  async getMyProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as Profile | null) ?? null;
  },

  /** プロフィールを作成・更新 */
  async upsertMyProfile(userId: string, name: string, role: UserRole): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, name: name.trim(), role })
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },
};
