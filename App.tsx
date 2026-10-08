import { SafeAreaView, StyleSheet, ActivityIndicator, View } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/hooks/useAuth";
import { AppProvider, useApp } from "./src/contexts/AppContext";
import { NavigationProvider, useNavigation } from "./src/contexts/NavigationContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SetupScreen } from "./src/screens/SetupScreen";
import { ItemListScreen } from "./src/screens/ItemListScreen";
import { CreateItemScreen } from "./src/screens/CreateItemScreen";
import { ItemDetailScreen } from "./src/screens/ItemDetailScreen";
import { SupportScreen } from "./src/screens/SupportScreen";
import { FamilyScreen } from "./src/screens/FamilyScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";

// ============================================================
// 画面ルーター（NavigationContext のスタックに従って描画）
// ============================================================
function ScreenRouter() {
  const { route } = useNavigation();

  switch (route.name) {
    case "itemList":
      return <ItemListScreen initialCategory={route.params?.category} />;
    case "createItem":
      return <CreateItemScreen />;
    case "itemDetail":
      return route.params ? <ItemDetailScreen itemId={route.params.itemId} /> : <HomeScreen />;
    case "support":
      return route.params ? <SupportScreen itemId={route.params.itemId} /> : <HomeScreen />;
    case "family":
      return <FamilyScreen />;
    case "history":
      return <HistoryScreen />;
    case "home":
    default:
      return <HomeScreen />;
  }
}

function RootNavigator() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: appLoading } = useApp();

  if (authLoading || (isAuthenticated && appLoading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // プロフィール（名前・役割）が未設定ならセットアップ画面へ
  if (!profile) {
    return <SetupScreen />;
  }

  return <ScreenRouter />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppProvider>
          <SafeAreaView style={styles.container}>
            <RootNavigator />
          </SafeAreaView>
        </AppProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3E9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F3E9",
  },
});
