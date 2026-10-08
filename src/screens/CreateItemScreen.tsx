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
import { CATEGORIES, Category } from "../types";
import { ScreenHeader } from "../components/ScreenHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";
import { formatYen, parseAmount } from "../utils/format";

// ============================================================
// 支援項目の新規作成画面（「種を植える」）
// ============================================================

export function CreateItemScreen() {
  const { family, profile } = useApp();
  const { replace, goBack } = useNavigation();

  const [name, setName] = useState("");
  const [priceText, setPriceText] = useState("");
  const [category, setCategory] = useState<Category>("学校");
  const [childName, setChildName] = useState("");
  const [memo, setMemo] = useState("");
  const [ownText, setOwnText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const price = parseAmount(priceText);
  const own = parseAmount(ownText);

  const handleCreate = async () => {
    if (!family) {
      Alert.alert("エラー", "家族との接続が必要です");
      return;
    }
    if (!name.trim()) {
      Alert.alert("入力エラー", "名称を入力してください");
      return;
    }
    if (price <= 0) {
      Alert.alert("入力エラー", "値段は1円以上で入力してください");
      return;
    }
    if (own > price) {
      Alert.alert("入力エラー", "自分が出せる額は値段以下にしてください");
      return;
    }

    setSubmitting(true);
    try {
      const item = await supportService.createItem({
        familyId: family.id,
        name: name.trim(),
        price,
        category,
        childName: childName.trim() || profile?.name || "",
        memo: memo.trim(),
        ownContribution: own,
      });
      Alert.alert("種を植えました！", `${item.name} を家族に届けます。`);
      // 作成画面を詳細画面に差し替える
      replace("itemDetail", { itemId: item.id });
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
        <ScreenHeader
          title="種を植える"
          subtitle="支援してほしいものを登録します"
          onBack={goBack}
        />

        <View style={styles.card}>
          <Text style={styles.label}>名称</Text>
          <TextInput
            style={styles.input}
            placeholder="例：ランドセル"
            value={name}
            onChangeText={setName}
            editable={!submitting}
          />

          <Text style={styles.label}>値段（円）</Text>
          <TextInput
            style={styles.input}
            placeholder="例：70000"
            value={priceText}
            onChangeText={(text) => setPriceText(text.replace(/[^\d]/g, ""))}
            keyboardType="number-pad"
            editable={!submitting}
          />

          <Text style={styles.label}>カテゴリー</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryChip, category === item && styles.categoryChipActive]}
                onPress={() => setCategory(item)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === item && styles.categoryChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>だれの項目か</Text>
          <TextInput
            style={styles.input}
            placeholder="例：まゆさん"
            value={childName}
            onChangeText={setChildName}
            editable={!submitting}
          />

          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="例：来春の入学に向けて"
            value={memo}
            onChangeText={setMemo}
            multiline
            editable={!submitting}
          />

          <Text style={styles.label}>自分が出せる額（円）</Text>
          <TextInput
            style={styles.input}
            placeholder="例：10000"
            value={ownText}
            onChangeText={(text) => setOwnText(text.replace(/[^\d]/g, ""))}
            keyboardType="number-pad"
            editable={!submitting}
          />
          {own > 0 && <Text style={styles.ownHint}>最初の応援として {formatYen(own)} を記録します</Text>}

          <PrimaryButton
            label="種を植える"
            onPress={handleCreate}
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
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
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
    paddingVertical: 13,
    fontSize: 17,
    marginBottom: 18,
  },
  memoInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  categoryChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  categoryChipText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: colors.primaryDark,
  },
  ownHint: {
    marginTop: -10,
    marginBottom: 16,
    fontSize: 13,
    color: colors.primary,
  },
  submit: {
    marginTop: 8,
  },
});

