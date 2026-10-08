import { supabase } from "../lib/supabase";
import { Family, FamilyMember } from "../types";

// ============================================================
// 家族（families / family_members）
// ============================================================
export const familyService = {
  /** 自分が参加している家族を取得（未参加なら null） */
  async getMyFamily(userId: string): Promise<Family | null> {
    const { data, error } = await supabase
      .from("family_members")
      .select("family_id, family:families(*)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    const family = (data as { family: Family | null } | null)?.family ?? null;
    return family;
  },

  /** 家族のメンバー一覧を取得 */
  async getMembers(familyId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from("family_members")
      .select("user_id, profile:profiles(name, role)")
      .eq("family_id", familyId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as FamilyMember[];
  },

  /** 家族コードを発行して家族を作成する */
  async createFamily(name: string): Promise<Family> {
    const { data, error } = await supabase.rpc("create_family", {
      p_name: name.trim() || "うちの家族",
    });
    if (error) throw error;
    return data as Family;
  },

  /** 家族コードを入力して家族に参加する */
  async joinFamily(code: string): Promise<Family> {
    const { data, error } = await supabase.rpc("join_family_by_code", {
      p_code: code.trim(),
    });
    if (error) throw error;
    return data as Family;
  },
};
