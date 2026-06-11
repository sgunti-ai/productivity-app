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
      {/* Main Content Container */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.background,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 16,
            paddingTop: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 5,
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
            onPress={() => {
              setDrawerOpen(false);
              router.push("/drawer-layout/(drawer-tabs)/search");
            }}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <MaterialIcons name="search" size={24} color={colors.foreground} />
          </Pressable>

          <Pressable
            onPress={() => {
              setDrawerOpen(false);
              router.push("/drawer-layout/(drawer-tabs)/profile");
            }}
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
            <Stack.Screen name="(drawer-tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>

      {/* Drawer Navigation - Positioned absolutely on top */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: drawerOpen ? 1000 : -1,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      >
        <DrawerNavigation isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </View>
    </View>
  );
}
