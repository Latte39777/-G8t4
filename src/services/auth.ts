import { supabase } from "../lib/supabase";

export const authService = {
  // ログイン
  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  // 新規登録
  async signUp(email: string, pass: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  // ログアウト
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
