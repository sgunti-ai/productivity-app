import { ScrollView, View, Text, Pressable, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";
import { getSettings, saveSetting } from "@/lib/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
    setIsDarkMode(savedSettings.theme === "dark");
    setNotificationsEnabled(savedSettings.notifications !== false);
  };

  const handleThemeToggle = async (value: boolean) => {
    setIsDarkMode(value);
    await saveSetting("theme", value ? "dark" : "light");
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveSetting("notifications", value);
  };

  const handleClearCompleted = async () => {
    Alert.alert(
      "Clear Completed Tasks",
      "Are you sure you want to delete all completed tasks? This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const tasks = await AsyncStorage.getItem("@focusflow_tasks");
              if (tasks) {
                const parsedTasks = JSON.parse(tasks);
                const filtered = parsedTasks.filter((t: any) => !t.completed);
                await AsyncStorage.setItem("@focusflow_tasks", JSON.stringify(filtered));
                Alert.alert("Success", "Completed tasks have been deleted");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to clear completed tasks");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const tasks = await AsyncStorage.getItem("@focusflow_tasks");
      const goals = await AsyncStorage.getItem("@focusflow_goals");
      const data = {
        tasks: tasks ? JSON.parse(tasks) : [],
        goals: goals ? JSON.parse(goals) : [],
        exportedAt: new Date().toISOString(),
      };
      console.log("Export data:", JSON.stringify(data, null, 2));
      Alert.alert("Success", "Data exported to console. Check your logs.");
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const SettingItem = ({
    label,
    description,
    onPress,
    value,
    isToggle = false,
  }: {
    label: string;
    description?: string;
    onPress?: () => void;
    value?: boolean;
    isToggle?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
            {description}
          </Text>
        )}
      </View>
      {isToggle && (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? colors.primary : colors.muted}
        />
      )}
    </Pressable>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            Settings
          </Text>
        </View>

        {/* Display Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, paddingHorizontal: 16, marginBottom: 8 }}>
            DISPLAY
          </Text>
          <SettingItem
            label="Dark Mode"
            description="Enable dark theme"
            value={isDarkMode}
            isToggle
            onPress={() => handleThemeToggle(!isDarkMode)}
          />
        </View>

        {/* Notifications Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, paddingHorizontal: 16, marginBottom: 8 }}>
            NOTIFICATIONS
          </Text>
          <SettingItem
            label="Enable Notifications"
            description="Receive reminders and updates"
            value={notificationsEnabled}
            isToggle
            onPress={() => handleNotificationsToggle(!notificationsEnabled)}
          />
        </View>

        {/* Data Management Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, paddingHorizontal: 16, marginBottom: 8 }}>
            DATA MANAGEMENT
          </Text>
          <SettingItem
            label="Export Data"
            description="Export all tasks and goals as JSON"
            onPress={handleExportData}
          />
          <SettingItem
            label="Clear Completed Tasks"
            description="Delete all finished tasks"
            onPress={handleClearCompleted}
          />
        </View>

        {/* About Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, paddingHorizontal: 16, marginBottom: 8 }}>
            ABOUT
          </Text>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              FocusFlow
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
              Version 1.0.0
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 12 }}>
              A personal productivity tool that combines task management, time planning, and goal tracking.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            © 2026 FocusFlow. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
