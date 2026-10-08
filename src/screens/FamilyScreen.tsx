import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { ScreenHeader } from "../components/ScreenHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { familyService } from "../services/family";
import { getErrorMessage } from "../utils/errors";

// ============================================================
// 家族コード画面
//   - 子育て世代：家族コードの発行・表示・共有
//   - 祖父母：家族コードの入力・参加
// ============================================================

export function FamilyScreen() {
  const { family, members, mode, refresh } = useApp();
  const { goBack } = useNavigation();
  const [codeInput, setCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await familyService.createFamily("うちの家族");
      await refresh();
      Alert.alert("家族コードを発行しました", "このコードを家族に共有してください。");
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length < 4) {
      Alert.alert("入力エラー", "家族コードを入力してください");
      return;
    }
    setSubmitting(true);
    try {
      await familyService.joinFamily(code);
      await refresh();
      Alert.alert("家族に参加しました！", "支援項目が見られるようになりました。");
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="家族をつなぐ" onBack={goBack} />

        {family ? (
          <>
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>家族コード</Text>
              <Text style={styles.codeText}>{family.family_code}</Text>
              <Text style={styles.codeHint}>
                このコードを家族に共有すると、支援項目を見ることができます。
              </Text>
            </View>

            <Text style={styles.sectionTitle}>メンバー</Text>
            <View style={styles.memberCard}>
              {members.length === 0 ? (
                <Text style={styles.memberEmpty}>メンバー情報がありません</Text>
              ) : (
                members.map((member) => (
                  <View key={member.user_id} style={styles.memberRow}>
                    <Text style={styles.memberName}>{member.profile?.name || "ななし"}</Text>
                    <Text style={styles.memberRole}>
                      {member.profile?.role === "grandparent" ? "祖父母" : "子育て世代"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>家族コードを発行する</Text>
              <Text style={styles.bodyText}>
                子育て世代の方はこちら。発行したコードを祖父母に共有してください。
              </Text>
              <PrimaryButton
                label="家族コードを発行する"
                onPress={handleCreate}
                loading={submitting}
                style={styles.sectionButton}
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>家族コードを入力する</Text>
              <Text style={styles.bodyText}>
                祖父母の方はこちら。教えてもらった家族コードを入力してください。
              </Text>
              <TextInput
                style={styles.input}
                placeholder="例：ABC12345"
                value={codeInput}
                onChangeText={(text) => setCodeInput(text.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!submitting}
              />
              <PrimaryButton
                label="家族に参加する"
                onPress={handleJoin}
                loading={submitting}
                variant={mode === "grandparent" ? "primary" : "outline"}
                style={styles.sectionButton}
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  codeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  codeLabel: {
    color: "#D9EAD3",
    fontSize: 14,
    fontWeight: "600",
  },
  codeText: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "bold",
    letterSpacing: 6,
    marginVertical: 10,
  },
  codeHint: {
    color: "#E8F0E4",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  memberCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  memberName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  memberRole: {
    fontSize: 13,
    color: colors.textMuted,
  },
  memberEmpty: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FBFAF6",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 22,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 14,
  },
  sectionButton: {
    marginTop: 4,
  },
});

