import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { UserRole } from "../types";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../hooks/useAuth";
import { useApp } from "../contexts/AppContext";
import { profileService } from "../services/profile";
import { getErrorMessage } from "../utils/errors";

// ============================================================
// 初回セットアップ（名前と立場の設定）
// 既存のログイン処理とは別の画面。認証情報には触れない。
// ============================================================

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; emoji: string }[] = [
  {
    value: "parent",
    label: "子育て世代",
    description: "支援してほしいものを登録する",
    emoji: "🌱",
  },
  {
    value: "grandparent",
    label: "祖父母",
    description: "家族の支援項目に応援する",
    emoji: "🌳",
  },
];

export function SetupScreen() {
  const { user } = useAuth();
  const { setProfile } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("parent");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("入力エラー", "お名前を入力してください");
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      const profile = await profileService.upsertMyProfile(user.id, name, role);
      setProfile(profile);
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>つながる子育て家計簿</Text>
        <Text style={styles.copy}>見えないお金の不安を、家族の安心に</Text>

        <View style={styles.card}>
          <Text style={styles.label}>お名前</Text>
          <TextInput
            style={styles.input}
            placeholder="例：まゆさん"
            value={name}
            onChangeText={setName}
            editable={!submitting}
          />

          <Text style={styles.label}>あなたの立場</Text>
          {ROLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.roleCard, role === option.value && styles.roleCardActive]}
              onPress={() => setRole(option.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>{option.emoji}</Text>
              <View style={styles.roleInfo}>
                <Text style={styles.roleLabel}>{option.label}</Text>
                <Text style={styles.roleDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <PrimaryButton
            label="はじめる"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primaryDark,
    textAlign: "center",
  },
  copy: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FBFAF6",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  roleEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  roleDescription: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  submit: {
    marginTop: 12,
  },
});
