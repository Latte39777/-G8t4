import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert(
          "登録完了",
          "アカウントを作成しました。メール確認が必要な場合があります。",
        );
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{isSignUp ? "新規登録" : "ログイン"}</Text>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "登録する" : "ログイン"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={loading}
          style={styles.toggleContainer}
        >
          <Text style={styles.toggleText}>
            {isSignUp
              ? "すでにアカウントをお持ちの方はこちら"
              : "アカウントをお持ちでない方はこちら"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    color: "#2196F3",
    fontSize: 14,
  },
});
