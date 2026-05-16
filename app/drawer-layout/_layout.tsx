import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { DrawerNavigation } from "@/components/drawer-navigation";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

export default function DrawerLayoutWrapper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const { state } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DrawerNavigation isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.background,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

          <View style={{ flex: 1, marginLeft: 12 }}>
            {/* Title will be set by individual screens */}
          </View>

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
        </View>

        {/* Content - Stack for nested screens */}
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(drawer-tabs)" />
          </Stack>
        </View>
      </View>
    </View>
  );
}
