import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import { SupportRecord } from "../types";
import { ScreenHeader } from "../components/ScreenHeader";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";
import { formatDate, formatYen } from "../utils/format";

// ============================================================
// 応援のきろく画面（家族全体）
// ============================================================

export function HistoryScreen() {
  const { family, profile } = useApp();
  const { goBack } = useNavigation();
  const [records, setRecords] = useState<SupportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!family) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRecords(await supportService.getFamilyRecords(family.id));
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [family]);

  useEffect(() => {
    load();
  }, [load]);

  const total = records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="家族の応援のきろく" onBack={goBack} />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>これまでの支援合計</Text>
          <Text style={styles.totalAmount}>{formatYen(total)}</Text>
          <Text style={styles.totalCount}>{records.length} 件の応援</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>まだ応援のきろくがありません</Text>
            <Text style={styles.emptyText}>
              祖父母が支援すると、ここに記録されます。
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {records.map((record) => {
              const isOwn = profile && record.supporter_id === profile.id;
              return (
                <View key={record.id} style={styles.recordRow}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>
                      {record.supporter?.name || "だれかさん"}
                      {isOwn ? "（自分）" : ""}
                    </Text>
                    <Text style={styles.recordDate}>{formatDate(record.created_at)}</Text>
                  </View>
                  {!!record.item && (
                    <Text style={styles.recordItem}>{record.item.name}</Text>
                  )}
                  <Text style={styles.recordAmount}>{formatYen(record.amount)}</Text>
                  {!!record.message && (
                    <Text style={styles.recordMessage}>「{record.message}」</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    color: "#D9EAD3",
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "bold",
    marginVertical: 6,
  },
  totalCount: {
    color: "#E8F0E4",
    fontSize: 13,
  },
  loader: {
    marginVertical: 24,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 14,
  },
  recordHeader: {
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
  recordItem: {
    marginTop: 4,
    fontSize: 13,
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
});
