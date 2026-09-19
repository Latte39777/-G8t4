import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supabase } from "./src/lib/supabase";

export default function App() {
  const [status, setStatus] = useState("接続確認中...");

  useEffect(() => {
    async function testConnection() {
      // Supabaseの認証APIを叩いて接続テスト
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Supabase 接続エラー:", error.message);
        setStatus(`接続失敗: ${error.message}`);
      } else {
        console.log("Supabase 接続成功！", data);
        setStatus("Supabase 接続成功！");
      }
    }

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
