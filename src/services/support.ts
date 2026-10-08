import { supabase } from "../lib/supabase";
import { Category, SupportItem, SupportRecord } from "../types";

// ============================================================
// 支援項目（support_items）と応援のきろく（support_records）
// ============================================================

export interface CreateSupportItemInput {
  familyId: string;
  name: string;
  price: number;
  category: Category;
  childName: string;
  memo: string;
  ownContribution: number;
}

export const supportService = {
  /** 家族の支援項目を一覧取得 */
  async getItems(familyId: string): Promise<SupportItem[]> {
    const { data, error } = await supabase
      .from("support_items")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SupportItem[];
  },

  /** 支援項目を1件取得 */
  async getItem(itemId: string): Promise<SupportItem | null> {
    const { data, error } = await supabase
      .from("support_items")
      .select("*")
      .eq("id", itemId)
      .maybeSingle();
    if (error) throw error;
    return (data as SupportItem | null) ?? null;
  },

  /** 支援項目と「応援のきろく」を取得 */
  async getItemWithRecords(
    itemId: string,
  ): Promise<{ item: SupportItem; records: SupportRecord[] } | null> {
    const { data, error } = await supabase
      .from("support_items")
      .select("*, support_records(*, supporter:profiles(name))")
      .eq("id", itemId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const { support_records, ...item } = data as SupportItem & {
      support_records: SupportRecord[];
    };
    const records = [...(support_records ?? [])].sort((a, b) =>
      (a.created_at || "").localeCompare(b.created_at || ""),
    );
    return { item: item as SupportItem, records };
  },

  /** 家族全体の「応援のきろく」を取得 */
  async getFamilyRecords(familyId: string): Promise<SupportRecord[]> {
    const { data, error } = await supabase
      .from("support_records")
      .select("*, supporter:profiles(name), item:support_items!inner(name, family_id)")
      .eq("item.family_id", familyId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as SupportRecord[];
  },

  /** 支援項目を作成する（「種を植える」） */
  async createItem(input: CreateSupportItemInput): Promise<SupportItem> {
    const { data, error } = await supabase.rpc("create_support_item", {
      p_family_id: input.familyId,
      p_name: input.name,
      p_price: Math.floor(input.price),
      p_category: input.category,
      p_child_name: input.childName,
      p_memo: input.memo,
      p_own: Math.max(0, Math.floor(input.ownContribution)),
    });
    if (error) throw error;
    return data as SupportItem;
  },

  /** 支援する（目標金額を超えないようサーバー側で調整される） */
  async addSupport(
    itemId: string,
    amount: number,
    message: string,
  ): Promise<SupportRecord> {
    const { data, error } = await supabase.rpc("add_support", {
      p_item_id: itemId,
      p_amount: Math.floor(amount),
      p_message: message.trim() || null,
    });
    if (error) throw error;
    return data as SupportRecord;
  },

  /**
   * サンプルデータ（学祭デモ用）をまとめて作成する。
   * 実際の決済は行わず、DB 上のシミュレーションのみ。
   */
  async seedSampleItems(familyId: string): Promise<void> {
    const samples: {
      name: string;
      price: number;
      category: Category;
      childName: string;
      memo: string;
      own: number;
    }[] = [
      { name: "ランドセル", price: 70000, category: "学校", childName: "まゆさん", memo: "来春の入学に向けて", own: 10000 },
      { name: "制服", price: 50000, category: "学校", childName: "まゆさん", memo: "入学時の一式", own: 5000 },
      { name: "入学用品", price: 30000, category: "学校", childName: "まゆさん", memo: "通学かばん・体操服など", own: 5000 },
      { name: "教材", price: 10000, category: "学校", childName: "そうたさん", memo: "ドリルと参考書", own: 2000 },
      { name: "ピアノ", price: 70000, category: "習いごと", childName: "まゆさん", memo: "ピアノ教室の月謝と楽譜", own: 10000 },
      { name: "水泳", price: 30000, category: "習いごと", childName: "そうたさん", memo: "スイミング教室の費用", own: 5000 },
      { name: "英会話", price: 50000, category: "習いごと", childName: "まゆさん", memo: "オンライン英会話の年間プラン", own: 10000 },
      { name: "スポーツ教室", price: 30000, category: "習いごと", childName: "そうたさん", memo: "サッカースクールの道具と月謝", own: 5000 },
      { name: "ベビーカー", price: 50000, category: "生活", childName: "そうたさん", memo: "軽くて折りたためるものが欲しい", own: 10000 },
      { name: "子ども用自転車", price: 30000, category: "生活", childName: "まゆさん", memo: "補助輪なしにチャレンジ", own: 5000 },
      { name: "子ども用家具", price: 30000, category: "生活", childName: "そうたさん", memo: "学習机と椅子", own: 5000 },
      { name: "保育用品", price: 10000, category: "生活", childName: "そうたさん", memo: "水筒・帽子・着替えセット", own: 2000 },
      { name: "誕生日プレゼント", price: 30000, category: "その他", childName: "まゆさん", memo: "10歳の記念に", own: 5000 },
      { name: "季節用品", price: 10000, category: "その他", childName: "そうたさん", memo: "冬物のコートとブーツ", own: 2000 },
      { name: "その他の子育て用品", price: 30000, category: "その他", childName: "まゆさん", memo: "日々の子育てに必要なもの", own: 5000 },
    ];

    for (const sample of samples) {
      await this.createItem({
        familyId,
        name: sample.name,
        price: sample.price,
        category: sample.category,
        childName: sample.childName,
        memo: sample.memo,
        ownContribution: sample.own,
      });
    }
  },
};
