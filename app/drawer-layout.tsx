import { View, Pressable, SafeAreaView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { DrawerNavigation } from "@/components/drawer-navigation";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

export default function DrawerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const { state } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DrawerNavigation isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.foreground,
            headerTitleStyle: {
              fontWeight: "600",
              fontSize: 18,
            },
            headerLeft: () => (
              <Pressable
                onPress={() => setDrawerOpen(!drawerOpen)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialIcons name="menu" size={28} color={colors.foreground} />
              </Pressable>
            ),
            headerRight: () => (
              <Pressable
                onPress={() => router.push("/(drawer-tabs)/profile")}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="person" size={18} color="white" />
                </View>
              </Pressable>
            ),
          }}
        >
          <Stack.Screen
            name="(drawer-tabs)"
            options={{
              headerShown: true,
              title: "FocusFlow",
            }}
          />
        </Stack>
      </View>
    </View>
  );
}
