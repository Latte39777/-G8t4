// ============================================================
// エラー表示ユーティリティ
// Supabase / RPC のエラーを日本語メッセージに変換する
// ============================================================

interface ErrorLike {
  message?: string;
  code?: string;
}

const MESSAGE_MAP: Record<string, string> = {
  not_authenticated: "ログイン状態を確認できませんでした。もう一度ログインしてください。",
  already_in_family: "すでに家族に接続しています。",
  family_not_found: "家族コードが見つかりません。コードを確認してください。",
  not_a_member: "この家族の情報にはアクセスできません。",
  name_required: "名称を入力してください。",
  invalid_price: "値段は1円以上で入力してください。",
  invalid_category: "カテゴリーが正しくありません。",
  invalid_amount: "支援金額は1円以上で入力してください。",
  goal_already_reached: "すでに支援目標を達成しています。",
  item_not_found: "支援項目が見つかりません。",
};

/** エラー内容に応じた日本語メッセージを返す */
export function getErrorMessage(error: unknown, fallback = "通信エラーが発生しました。"): string {
  const err = (error ?? {}) as ErrorLike;
  const message = err.message ?? "";

  for (const [key, text] of Object.entries(MESSAGE_MAP)) {
    if (message.includes(key)) return text;
  }

  // テーブル / 関数が未作成の場合
  if (err.code === "PGRST205" || message.includes("Could not find the table")) {
    return "データベースが未設定です。Supabase の SQL Editor で supabase/schema.sql を実行してください。";
  }
  if (err.code === "PGRST202" || message.includes("Could not find the function")) {
    return "データベースの関数が未設定です。Supabase の SQL Editor で supabase/schema.sql を実行してください。";
  }

  return message || fallback;
}
