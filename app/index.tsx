import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function RootIndex() {
  const { state } = useAuth();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (!state.isLoading) {
      if (state.isAuthenticated) {
        router.replace("/drawer-layout");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
