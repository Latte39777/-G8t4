import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { useAuth } from "../hooks/useAuth";

export function HomeScreen() {
  const { user, signOut, loading } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ホーム画面</Text>
      <Text style={styles.message}>ログインに成功しました！</Text>
      {user?.email && <Text style={styles.email}>{user.email}</Text>}
      <View style={styles.buttonContainer}>
        <Button title="ログアウト" onPress={signOut} color="#FF5252" disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4CAF50",
  },
  email: {
    fontSize: 14,
    marginBottom: 24,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 12,
    width: "60%",
  },
});
