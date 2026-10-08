import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { SupportItem } from "../types";
import { ScreenHeader } from "../components/ScreenHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";
import { calcRemaining, formatYen, parseAmount } from "../utils/format";

// ============================================================
// 支援画面（祖父母モード）
// 実際の決済は行わず、DB の支援金額を更新するシミュレーションです
// ============================================================

const PRESET_AMOUNTS = [5000, 10000, 20000];

export function SupportScreen({ itemId }: { itemId: string }) {
  const { goBack, replace } = useNavigation();
  const [item, setItem] = useState<SupportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number>(0);
  const [customText, setCustomText] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportService.getItemWithRecords(itemId);
      if (!data) {
        Alert.alert("エラー", "支援項目が見つかりません");
        goBack();
        return;
      }
      setItem(data.item);
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [itemId, goBack]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !item) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const remaining = calcRemaining(item.supported_amount, item.price);
  const custom = parseAmount(customText);
  const amount = custom > 0 ? Math.min(custom, remaining) : selected;

  const handleSupport = async () => {
    if (amount <= 0) {
      Alert.alert("入力エラー", "支援する金額を選択または入力してください");
      return;
    }
    const actual = Math.min(amount, remaining);
    Alert.alert(
      "支援しますか？",
      `${item.name} に ${formatYen(actual)} の応援を届けます。\n（実際のお金のやり取りは行いません）`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "支援する",
          onPress: async () => {
            setSubmitting(true);
            try {
              await supportService.addSupport(itemId, actual, message);
              Alert.alert("応援を届けました！", "植物がぐんと育ちました 🌱");
              replace("itemDetail", { itemId });
            } catch (error) {
              Alert.alert("エラー", getErrorMessage(error));
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="支援する" subtitle={item.name} onBack={goBack} />

        <View style={styles.card}>
          <Text style={styles.currentLabel}>いまの支援金額</Text>
          <Text style={styles.currentAmount}>
            {formatYen(item.supported_amount)}
            <Text style={styles.currentTotal}> / {formatYen(item.price)}</Text>
          </Text>
          <Text style={styles.remainingLabel}>
            のこり {formatYen(remaining)}（最大 {formatYen(remaining)} まで支援できます）
          </Text>

          <Text style={styles.label}>金額を選ぶ</Text>
          <View style={styles.presetRow}>
            {PRESET_AMOUNTS.map((preset) => {
              const isOver = preset > remaining;
              const isSelected = custom === 0 && selected === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => {
                    setSelected(preset);
                    setCustomText("");
                  }}
                  disabled={isOver || submitting}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.presetText, isSelected && styles.presetTextActive]}
                  >
                    {formatYen(preset)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>金額を入力する（任意）</Text>
          <TextInput
            style={styles.input}
            placeholder={`例：${Math.min(3000, remaining || 3000)}`}
            value={customText}
            onChangeText={(text) => {
              setCustomText(text.replace(/[^\d]/g, ""));
              setSelected(0);
            }}
            keyboardType="number-pad"
            editable={!submitting}
          />
          {custom > remaining && (
            <Text style={styles.capHint}>
              のこり金額を超えるため {formatYen(remaining)} として記録します
            </Text>
          )}

          <Text style={styles.label}>メッセージ（任意）</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="例：入学おめでとう"
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!submitting}
          />

          <PrimaryButton
            label={amount > 0 ? `${formatYen(Math.min(amount, remaining))} 支援する` : "支援する"}
            onPress={handleSupport}
            loading={submitting}
            disabled={amount <= 0 || remaining <= 0}
            style={styles.submit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
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
  currentLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  currentAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primaryDark,
    marginTop: 4,
  },
  currentTotal: {
    fontSize: 16,
    fontWeight: "normal",
    color: colors.textMuted,
  },
  remainingLabel: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 15,
    color: colors.primary,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  presetChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: colors.white,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  presetText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textMuted,
  },
  presetTextActive: {
    color: colors.primaryDark,
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
  messageInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  capHint: {
    marginTop: -10,
    marginBottom: 16,
    fontSize: 13,
    color: colors.primary,
  },
  submit: {
    marginTop: 8,
  },
});

