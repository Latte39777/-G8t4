import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { Category, CATEGORIES, SupportItem } from "../types";
import { ScreenHeader } from "../components/ScreenHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { SupportItemCard } from "../components/SupportItemCard";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";

// ============================================================
// カテゴリー別 支援項目一覧画面
// ============================================================

export function ItemListScreen({ initialCategory }: { initialCategory?: Category }) {
  const { family, mode } = useApp();
  const { goBack, navigate, replace } = useNavigation();
  const [selected, setSelected] = useState<Category | null>(initialCategory ?? null);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!family) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(await supportService.getItems(family.id));
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [family]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = selected ? items.filter((item) => item.category === selected) : items;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="支援項目一覧" onBack={goBack} />

        {/* カテゴリーフィルター */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selected === null && styles.filterChipActive]}
            onPress={() => setSelected(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, selected === null && styles.filterTextActive]}>
              すべて
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selected === category && styles.filterChipActive]}
              onPress={() => setSelected(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterText, selected === category && styles.filterTextActive]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>該当する項目がありません</Text>
            <Text style={styles.emptyText}>
              {mode === "parent"
                ? "「＋ 新しく追加する」から支援してほしいものを登録できます。"
                : "子育て世代が支援項目を登録すると、ここに表示されます。"}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <SupportItemCard
              key={item.id}
              item={item}
              onPress={() => navigate("itemDetail", { itemId: item.id })}
            />
          ))
        )}

        {mode === "parent" && !loading && (
          <PrimaryButton
            label="＋ 新しく追加する"
            onPress={() => replace("createItem")}
            style={styles.createButton}
          />
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
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    alignItems: "center",
  },
  filterChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  filterText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primaryDark,
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
  createButton: {
    marginTop: 16,
  },
});
