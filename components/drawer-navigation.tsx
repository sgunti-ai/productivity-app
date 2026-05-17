import { View, Text, Pressable, ScrollView, Animated, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

interface DrawerItem {
  label: string;
  icon: string;
  route: string;
}

interface DrawerNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 280;
const SCREEN_WIDTH = Dimensions.get("window").width;

export function DrawerNavigation({ isOpen, onClose }: DrawerNavigationProps) {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const { state, logout } = useAuth();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const menuItems: DrawerItem[] = [
    { label: "Home", icon: "home", route: "/drawer-layout/(drawer-tabs)" },
    { label: "Tasks", icon: "checklist", route: "/drawer-layout/(drawer-tabs)/tasks" },
    { label: "Calendar", icon: "calendar-today", route: "/drawer-layout/(drawer-tabs)/calendar" },
    { label: "Goals", icon: "track-changes", route: "/drawer-layout/(drawer-tabs)/goals" },
    { label: "Habits", icon: "repeat", route: "/drawer-layout/(drawer-tabs)/habits" },
    { label: "Analytics", icon: "bar-chart", route: "/drawer-layout/(drawer-tabs)/analytics" },
    { label: "Profile", icon: "person", route: "/drawer-layout/(drawer-tabs)/profile" },
    { label: "Settings", icon: "settings", route: "/drawer-layout/(drawer-tabs)/settings" },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
    onClose();
  };

  const isActive = (route: string) => {
    return pathname.includes(route.split("/").pop() || "");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            opacity: fadeAnim,
            zIndex: 999,
          }}
          onTouchEnd={onClose}
        />
      )}

      {/* Drawer */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.background,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          transform: [{ translateX: slideAnim }],
          zIndex: 1000,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* User Profile Section */}
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 20,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 4 }}>
              {state.user?.name}
            </Text>
            <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)" }}>
              {state.user?.email}
            </Text>
          </View>

          {/* Menu Items */}
          <View style={{ paddingVertical: 8 }}>
            {menuItems.map((item, index) => {
              const active = isActive(item.route);
              return (
                <Pressable
                  key={index}
                  onPress={() => handleNavigate(item.route)}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: active ? colors.surface : "transparent",
                    opacity: pressed ? 0.7 : 1,
                    borderLeftWidth: active ? 4 : 0,
                    borderLeftColor: active ? colors.primary : "transparent",
                  })}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={24}
                    color={active ? colors.primary : colors.muted}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: active ? "600" : "500",
                      color: active ? colors.primary : colors.foreground,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 12,
              marginHorizontal: 16,
            }}
          />

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialIcons name="logout" size={24} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 15, fontWeight: "500", color: colors.error }}>
              Logout
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </>
  );
}
