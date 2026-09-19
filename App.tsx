import { SafeAreaView, StyleSheet, ActivityIndicator, View } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/hooks/useAuth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return isAuthenticated ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <RootNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
