import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { CATEGORIES, Category, Family, SupportItem } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useApp } from "../contexts/AppContext";
import { useNavigation } from "../contexts/NavigationContext";
import { supportService } from "../services/support";
import { getErrorMessage } from "../utils/errors";
import { ModeToggle } from "../components/ModeToggle";
import { CategoryCard } from "../components/CategoryCard";
import { SupportItemCard } from "../components/SupportItemCard";
import { PrimaryButton } from "../components/PrimaryButton";

// ============================================================
// ホーム画面
// 上部にタイトル・キャッチコピー・モード切替（子育て世代 / 祖父母）
// 子育て世代: カテゴリーごとの支援項目 + 「＋ 新しく追加する」
// 祖父母:     家族の支援項目一覧
// ============================================================

export function HomeScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, family, mode, setMode, refresh } = useApp();
  const { navigate } = useNavigation();
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadItems = useCallback(async () => {
    if (!family) {
      setItems([]);
      setLoadingItems(false);
      return;
    }
    setLoadingItems(true);
    try {
      setItems(await supportService.getItems(family.id));
    } catch (error) {
      Alert.alert("エラー", getErrorMessage(error));
    } finally {
      setLoadingItems(false);
    }
  }, [family]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadItems(), refresh()]);
    setRefreshing(false);
  };

  const handleCreate = () => {
    if (!family) {
      Alert.alert("家族と接続してください", "支援項目を作るには、まず家族との接続が必要です。", [
        { text: "キャンセル", style: "cancel" },
        { text: "家族をつなぐ", onPress: () => navigate("family") },
      ]);
      return;
    }
    navigate("createItem");
  };

  const handleSeed = () => {
    if (!family) return;
    Alert.alert(
      "サンプルデータ",
      "学祭デモ用の支援項目（ランドセル・ピアノ・ベビーカーなど）をまとめて登録します。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "登録する",
          onPress: async () => {
            setSeeding(true);
            try {
              await supportService.seedSampleItems(family.id);
              await loadItems();
            } catch (error) {
              Alert.alert("エラー", getErrorMessage(error));
            } finally {
              setSeeding(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>つながる子育て家計簿</Text>
          <Text style={styles.catchCopy}>見えないお金の不安を、家族の安心に</Text>
          <ModeToggle mode={mode} onChange={setMode} />
        </View>

        {mode === "parent" ? (
          <ParentHomeContent
            items={items}
            loading={loadingItems}
            family={family}
            seeding={seeding}
            onSeed={handleSeed}
            onOpenFamily={() => navigate("family")}
            onOpenHistory={() => navigate("history")}
            onOpenItemList={(category) => navigate("itemList", { category })}
          />
        ) : (
          <GrandparentHomeContent
            items={items}
            loading={loadingItems}
            family={family}
            onOpenFamily={() => navigate("family")}
            onOpenHistory={() => navigate("history")}
            onOpenItem={(itemId) => navigate("itemDetail", { itemId })}
          />
        )}

        <View style={styles.footer}>
          {profile && <Text style={styles.userText}>{profile.name} さんでログイン中</Text>}
          {user?.email && <Text style={styles.emailText}>{user.email}</Text>}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={signOut}
            disabled={authLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {mode === "parent" && (
        <View style={styles.fabContainer}>
          <PrimaryButton label="＋ 新しく追加する" onPress={handleCreate} />
        </View>
      )}
    </View>
  );
}

// ============================================================
// 子育て世代モードの内容
// ============================================================
function ParentHomeContent({
  items,
  loading,
  family,
  seeding,
  onSeed,
  onOpenFamily,
  onOpenHistory,
  onOpenItemList,
}: {
  items: SupportItem[];
  loading: boolean;
  family: Family | null;
  seeding: boolean;
  onSeed: () => void;
  onOpenFamily: () => void;
  onOpenHistory: () => void;
  onOpenItemList: (category: Category) => void;
}) {
  return (
    <View>
      <View style={styles.familyRow}>
        <TouchableOpacity style={styles.familyChip} onPress={onOpenFamily} activeOpacity={0.8}>
          <Text style={styles.familyChipLabel}>家族コード</Text>
          <Text style={styles.familyChipCode}>{family ? family.family_code : "未接続"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyChip} onPress={onOpenHistory} activeOpacity={0.8}>
          <Text style={styles.historyChipText}>応援のきろく</Text>
        </TouchableOpacity>
      </View>

      {!family && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>家族とつながりましょう</Text>
          <Text style={styles.noticeText}>
            家族コードを発行して共有すると、家族だけが支援項目を見ることができます。
          </Text>
          <PrimaryButton label="家族をつなぐ" onPress={onOpenFamily} style={styles.noticeButton} />
        </View>
      )}

      <Text style={styles.sectionTitle}>カテゴリー</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        CATEGORIES.map((category) => {
          const inCategory = items.filter((item) => item.category === category);
          const supported = inCategory.reduce((sum, item) => sum + item.supported_amount, 0);
          const price = inCategory.reduce((sum, item) => sum + item.price, 0);
          return (
            <CategoryCard
              key={category}
              category={category}
              count={inCategory.length}
              supported={supported}
              price={price}
              onPress={() => onOpenItemList(category)}
            />
          );
        })
      )}

      {family && items.length === 0 && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>まずは種を植えてみましょう</Text>
          <Text style={styles.noticeText}>
            「＋ 新しく追加する」から支援してほしいものを登録できます。
          </Text>
          <PrimaryButton
            label="サンプルデータを用意する"
            onPress={onSeed}
            loading={seeding}
            variant="outline"
            style={styles.noticeButton}
          />
        </View>
      )}
    </View>
  );
}

// ============================================================
// 祖父母モードの内容
// ============================================================
function GrandparentHomeContent({
  items,
  loading,
  family,
  onOpenFamily,
  onOpenHistory,
  onOpenItem,
}: {
  items: SupportItem[];
  loading: boolean;
  family: Family | null;
  onOpenFamily: () => void;
  onOpenHistory: () => void;
  onOpenItem: (itemId: string) => void;
}) {
  return (
    <View>
      <View style={styles.familyRow}>
        <TouchableOpacity style={styles.familyChip} onPress={onOpenFamily} activeOpacity={0.8}>
          <Text style={styles.familyChipLabel}>家族コード</Text>
          <Text style={styles.familyChipCode}>{family ? family.family_code : "未接続"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyChip} onPress={onOpenHistory} activeOpacity={0.8}>
          <Text style={styles.historyChipText}>応援のきろく</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>家族の支援項目</Text>

      {!family ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>家族コードを入力してください</Text>
          <Text style={styles.noticeText}>
            子育て世代に教えてもらった家族コードを入力すると、支援項目が見られます。
          </Text>
          <PrimaryButton label="家族をつなぐ" onPress={onOpenFamily} style={styles.noticeButton} />
        </View>
      ) : loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>まだ支援項目がありません</Text>
          <Text style={styles.noticeText}>
            子育て世代が「種を植える」と、ここに表示されます。
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <SupportItemCard key={item.id} item={item} onPress={() => onOpenItem(item.id)} />
        ))
      )}
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primaryDark,
    textAlign: "center",
    marginTop: 8,
  },
  catchCopy: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  familyRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  familyChip: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  familyChipLabel: {
    color: "#D9EAD3",
    fontSize: 12,
  },
  familyChipCode: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 2,
  },
  historyChip: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  historyChipText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    marginTop: 4,
  },
  noticeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
  },
  noticeText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  noticeButton: {
    marginTop: 14,
  },
  loader: {
    marginVertical: 24,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  userText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emailText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },
});




