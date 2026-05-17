import { View, Pressable, Animated, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { DrawerNavigation } from "@/components/drawer-navigation";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";

const DRAWER_WIDTH = 280;

export default function DrawerLayoutWrapper() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const { state } = useAuth();
  
  const drawerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: drawerOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [drawerOpen, drawerAnim]);

  const drawerTranslate = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const contentTranslate = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, DRAWER_WIDTH],
  });

  const backdropOpacity = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, flexDirection: "row" }}>
      {/* Drawer - Animated side panel */}
      <Animated.View
        style={{
          width: DRAWER_WIDTH,
          backgroundColor: colors.background,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          transform: [{ translateX: drawerTranslate }],
          zIndex: 100,
        }}
      >
        <DrawerNavigation isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </Animated.View>

      {/* Main Content Area */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          transform: [{ translateX: contentTranslate }],
        }}
      >
        {/* Backdrop */}
        {drawerOpen && (
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              opacity: backdropOpacity,
              zIndex: 50,
            }}
            onTouchEnd={() => setDrawerOpen(false)}
          />
        )}

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
            zIndex: 10,
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
            onPress={() => router.push("/drawer-layout/(drawer-tabs)/profile")}
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
      </Animated.View>
    </View>
  );
}
