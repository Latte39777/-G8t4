import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category } from "../types";
import { colors, radius } from "../theme";
import { calcPercent, formatYen } from "../utils/format";
import { PlantGrowth } from "./PlantGrowth";

// ============================================================
// カテゴリーカード（子育て世代ホーム用）
//   件数・今まで支援してもらった金額・植物を表示する
// ============================================================

interface CategoryCardProps {
  category: Category;
  count: number;
  supported: number;
  price: number;
  onPress: () => void;
}

const CATEGORY_ICON: Record<Category, string> = {
  学校: "🎒",
  習いごと: "🎵",
  生活: "🍼",
  その他: "🎁",
};

export function CategoryCard({ category, count, supported, price, onPress }: CategoryCardProps) {
  const percent = calcPercent(supported, price);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{CATEGORY_ICON[category]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{category}</Text>
          <Text style={styles.count}>{count}件の支援項目</Text>
          <Text style={styles.amount}>
            今まで {formatYen(supported)}
            <Text style={styles.amountTotal}> / {formatYen(price)}</Text>
          </Text>
          <Text style={styles.percent}>{percent}% 育っています</Text>
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
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  count: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  amount: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  amountTotal: {
    fontSize: 13,
    fontWeight: "normal",
    color: colors.textMuted,
  },
  percent: {
    marginTop: 2,
    fontSize: 13,
    color: colors.accent,
    fontWeight: "600",
  },
  plantBox: {
    marginLeft: 8,
  },
});
