import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SupportItem } from "../types";
import { colors, radius } from "../theme";
import { calcPercent, calcRemaining, formatYen } from "../utils/format";
import { ProgressBar } from "./ProgressBar";
import { PlantGrowth } from "./PlantGrowth";

// ============================================================
// 支援項目カード（一覧用）
//   ランドセル / ¥56,000 / ¥70,000 / 80% のように一目で分かるように
// ============================================================

interface SupportItemCardProps {
  item: SupportItem;
  onPress: () => void;
}

export function SupportItemCard({ item, onPress }: SupportItemCardProps) {
  const percent = calcPercent(item.supported_amount, item.price);
  const remaining = calcRemaining(item.supported_amount, item.price);
  const reached = remaining <= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          {!!item.child_name && <Text style={styles.child}>{item.child_name}</Text>}

          <Text style={styles.amount}>
            {formatYen(item.supported_amount)}
            <Text style={styles.amountTotal}> / {formatYen(item.price)}</Text>
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.progressBox}>
              <ProgressBar percent={percent} height={12} />
            </View>
            <Text style={styles.percent}>{percent}%</Text>
          </View>

          {reached ? (
            <Text style={styles.reached}>🌱 支援目標達成！</Text>
          ) : (
            <Text style={styles.remaining}>
              のこり {percent === 100 ? 0 : 100 - percent}%（あと{formatYen(remaining)}）
            </Text>
          )}
        </View>

        <View style={styles.plantBox}>
          <PlantGrowth percent={percent} size="small" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flexShrink: 1,
    fontSize: 19,
    fontWeight: "bold",
    color: colors.text,
    marginRight: 8,
  },
  categoryChip: {
    backgroundColor: colors.soft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  child: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textMuted,
  },
  amount: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  amountTotal: {
    fontSize: 15,
    fontWeight: "normal",
    color: colors.textMuted,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBox: {
    flex: 1,
    marginRight: 10,
  },
  percent: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.primary,
    width: 52,
    textAlign: "right",
  },
  remaining: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
  },
  reached: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  plantBox: {
    marginLeft: 4,
  },
});
