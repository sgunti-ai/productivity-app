import { ScrollView, View, Text, Pressable, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { getTodayDate } from "@/lib/storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function HabitsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, completeHabitToday, deleteHabit } = useApp();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"streak" | "completion" | "title">("streak");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

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

  const sortedHabits = [...state.habits].sort((a, b) => {
    if (sortBy === "streak") {
      return getHabitStreak(b.id) - getHabitStreak(a.id);
    } else if (sortBy === "completion") {
      return getCompletionPercentage(b.id) - getCompletionPercentage(a.id);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    Alert.alert("Delete Habits", `Delete ${selectedHabits.size} habit(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const habitId of selectedHabits) {
            await deleteHabit(habitId);
          }
          setSelectedHabits(new Set());
          setBatchMode(false);
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/drawer-layout/habit-modal")}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            Habits
          </Text>
          {batchMode && (
            <Pressable
              onPress={() => {
                setBatchMode(false);
                setSelectedHabits(new Set());
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          )}
        </View>

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

        {/* Sort Options */}
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(["streak", "completion", "title"] as const).map((sort) => (
              <Pressable
                key={sort}
                onPress={() => setSortBy(sort)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor: sortBy === sort ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: sortBy === sort ? "white" : colors.foreground,
                    fontSize: 11,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {sort}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Batch Actions Bar */}
        {batchMode && selectedHabits.size > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.foreground, alignSelf: "center" }}>
              {selectedHabits.size} selected
            </Text>
            <Pressable
              onPress={handleBatchDelete}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: colors.error,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>Delete</Text>
            </Pressable>
          </View>
        )}

        {/* Habits List */}
        {sortedHabits.length > 0 ? (
          sortedHabits.map((item) => {
            const isCompleted = isHabitCompletedToday(item.id);
            const streak = getHabitStreak(item.id);
            const completionPercentage = getCompletionPercentage(item.id);
            const isExpanded = expandedHabitId === item.id;
            const isSelected = selectedHabits.has(item.id);

            return (
              <View key={item.id} style={{ marginBottom: 12 }}>
                <Pressable
                  onLongPress={() => {
                    setBatchMode(true);
                    toggleHabitSelection(item.id);
                  }}
                  onPress={() => {
                    if (batchMode) {
                      toggleHabitSelection(item.id);
                    } else {
                      setExpandedHabitId(isExpanded ? null : item.id);
                    }
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected ? colors.primary + "20" : colors.surface,
                    borderLeftWidth: 4,
                    borderLeftColor: item.color,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? colors.primary : colors.surface,
                  })}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    {batchMode && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 8,
                        }}
                      >
                        {isSelected && <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>}
                      </View>
                    )}
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
                    {!batchMode && (
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
                    )}
                  </View>
                </Pressable>

                {/* Expanded Details */}
                {isExpanded && !batchMode && (
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
                        onPress={() => router.push({ pathname: "/drawer-layout/habit-modal", params: { habitId: item.id } })}
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
                        onPress={() => {
                          Alert.alert("Delete Habit", `Delete "${item.title}"?`, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => {
                                deleteHabit(item.id);
                                setExpandedHabitId(null);
                              },
                            },
                          ]);
                        }}
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
          })
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>No habits yet</Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Create your first habit to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
