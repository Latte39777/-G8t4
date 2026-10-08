import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { SupportItem, SupportRecord } from "../types";
import { ScreenHeader } from "../components/ScreenHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { PlantGrowth } from "../components/PlantGrowth";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";
import { calcPercent, calcRemaining, formatDate, formatYen } from "../utils/format";
import { isGoalReached } from "../utils/plant";

// ============================================================
// 支援項目詳細画面
//   植物の成長・支援達成率・残り金額・メモ・応援のきろくを表示
//   祖父母モードでは「支援する」ボタンを表示
// ============================================================

export function ItemDetailScreen({ itemId }: { itemId: string }) {
  const { mode } = useApp();
  const { goBack, replace } = useNavigation();
  const [item, setItem] = useState<SupportItem | null>(null);
  const [records, setRecords] = useState<SupportRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
      setRecords(data.records);
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

  const percent = calcPercent(item.supported_amount, item.price);
  const remaining = calcRemaining(item.supported_amount, item.price);
  const reached = isGoalReached(item.supported_amount, item.price);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title={item.name} onBack={goBack} />

        <Text style={styles.summary}>
          計 {formatYen(item.price)}
          {item.child_name ? `・${item.child_name}` : ""}・{item.category}
        </Text>

        {/* 植物 */}
        <View style={styles.plantCard}>
          <PlantGrowth percent={percent} size="large" showLabel />
        </View>

        {/* 達成状況 */}
        <View style={styles.progressCard}>
          {reached ? (
            <View style={styles.reachedBanner}>
              <Text style={styles.reachedTitle}>🎉 支援目標達成！</Text>
              <Text style={styles.reachedText}>
                家族からの応援で、{item.name}の植物が完成しました。
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.progressLabel}>支援達成率</Text>
              <Text style={styles.progressPercent}>{percent}%</Text>
              <ProgressBar percent={percent} height={16} />
              <Text style={styles.progressAmount}>
                {formatYen(item.supported_amount)}
                <Text style={styles.progressAmountTotal}> / {formatYen(item.price)}</Text>
              </Text>
              <Text style={styles.remainingText}>
                のこり{100 - percent}%（あと{formatYen(remaining)}）です
              </Text>
            </>
          )}
        </View>

        {/* メモ */}
        {!!item.memo && (
          <View style={styles.memoCard}>
            <Text style={styles.memoLabel}>メモ</Text>
            <Text style={styles.memoText}>{item.memo}</Text>
          </View>
        )}

        {/* 応援のきろく */}
        <View style={styles.recordsCard}>
          <Text style={styles.recordsTitle}>応援のきろく</Text>
          {records.length === 0 ? (
            <Text style={styles.recordsEmpty}>まだ応援のきろくはありません</Text>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.recordRow}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>
                    {record.supporter?.name || "だれかさん"}
                  </Text>
                  <Text style={styles.recordDate}>{formatDate(record.created_at)}</Text>
                </View>
                <Text style={styles.recordAmount}>{formatYen(record.amount)}</Text>
                {!!record.message && (
                  <Text style={styles.recordMessage}>「{record.message}」</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 祖父母モード: 支援する */}
      {mode === "grandparent" && !reached && (
        <View style={styles.supportButtonBox}>
          <PrimaryButton label="支援する" onPress={() => replace("support", { itemId })} />
        </View>
      )}
    </View>
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
    paddingBottom: 40,
  },
  summary: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 14,
  },
  plantCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 44,
    fontWeight: "bold",
    color: colors.primaryDark,
    marginVertical: 4,
  },
  progressAmount: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  progressAmountTotal: {
    fontSize: 16,
    fontWeight: "normal",
    color: colors.textMuted,
  },
  remainingText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  reachedBanner: {
    alignItems: "center",
    paddingVertical: 8,
  },
  reachedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  reachedText: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  memoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  memoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textMuted,
    marginBottom: 6,
  },
  memoText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  recordsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  recordsEmpty: {
    fontSize: 14,
    color: colors.textMuted,
  },
  recordRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
  },
  recordInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  recordDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recordAmount: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  recordMessage: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: colors.soft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  supportButtonBox: {
    padding: 20,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

