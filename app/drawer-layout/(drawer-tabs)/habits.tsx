import { ScrollView, View, Text, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { getTodayDate } from "@/lib/storage";

export default function HabitsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, completeHabitToday } = useApp();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const today = getTodayDate();

  const getHabitStreak = (habitId: string): number => {
    const streak = state.streaks.find((s) => s.habitId === habitId);
    return streak?.currentStreak || 0;
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const habit = state.habits.find((h) => h.id === habitId);
    return habit?.completedDates.includes(today) || false;
  };

  const getCompletionPercentage = (habitId: string): number => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

    const completedInMonth = habit.completedDates.filter((date) => date >= thirtyDaysAgoStr).length;
    return Math.round((completedInMonth / 30) * 100);
  };

  const renderHabitItem = ({ item }: { item: typeof state.habits[0] }) => {
    const isCompleted = isHabitCompletedToday(item.id);
    const streak = getHabitStreak(item.id);
    const completionPercentage = getCompletionPercentage(item.id);
    const isExpanded = expandedHabitId === item.id;

    return (
      <View style={{ marginBottom: 12 }}>
        <Pressable
          onPress={() => setExpandedHabitId(isExpanded ? null : item.id)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            padding: 12,
            borderRadius: 8,
            backgroundColor: colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: item.color,
          })}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                {item.title}
              </Text>
              <View style={{ flexDirection: "row", marginTop: 4, gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>🔥</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
                    {streak} day streak
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {completionPercentage}% this month
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => completeHabitToday(item.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isCompleted ? colors.success : colors.border,
                justifyContent: "center",
                alignItems: "center",
              })}
            >
              <Text style={{ fontSize: 20, color: isCompleted ? "white" : colors.muted }}>
                {isCompleted ? "✓" : "○"}
              </Text>
            </Pressable>
          </View>
        </Pressable>

        {/* Expanded Details */}
        {isExpanded && (
          <View
            style={{
              marginTop: 8,
              padding: 12,
              backgroundColor: colors.surface,
              borderRadius: 8,
              marginLeft: 4,
              borderLeftWidth: 4,
              borderLeftColor: item.color,
            }}
          >
            {item.description && (
              <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>
                {item.description}
              </Text>
            )}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                Frequency
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, textTransform: "capitalize" }}>
                {item.frequency}
              </Text>
            </View>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                Completion History (Last 7 Days)
              </Text>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split("T")[0];
                  const isCompleted = item.completedDates.includes(dateStr);
                  return (
                    <View
                      key={i}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: isCompleted ? colors.primary : colors.border,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 10, color: isCompleted ? "white" : colors.muted }}>
                        {isCompleted ? "✓" : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => router.push({ pathname: "/habit-modal", params: { habitId: item.id } })}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                  alignItems: "center",
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor: colors.error,
                  opacity: pressed ? 0.8 : 1,
                  alignItems: "center",
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/habit-modal")}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
          zIndex: 10,
        })}
      >
        <Text style={{ fontSize: 28, color: "white" }}>+</Text>
      </Pressable>

      <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Habits
      </Text>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.primary }}>
            {state.habits.length}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Active Habits</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.success }}>
            {state.habits.filter((h) => isHabitCompletedToday(h.id)).length}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Completed Today</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.warning }}>
            {Math.max(...state.habits.map((h) => getHabitStreak(h.id)), 0)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Best Streak</Text>
        </View>
      </View>

      {/* Habits List */}
      <FlatList
        data={state.habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>No habits yet</Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Create your first habit to get started
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
