import { ScrollView, View, Text, Pressable, TextInput, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { generateId, getTodayDate } from "@/lib/storage";
import { Task } from "@/lib/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useSwipeNavigation, getNextScreen } from "@/hooks/use-swipe-navigation";

const PRIORITY_COLORS = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
};

const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, updateTask, deleteTask } = useApp();

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipeLeft: () => {
      const nextScreen = getNextScreen("tasks", "left");
      if (nextScreen === "calendar") router.push("/drawer-layout/(drawer-tabs)/calendar");
      else if (nextScreen === "goals") router.push("/drawer-layout/(drawer-tabs)/goals");
      else if (nextScreen === "habits") router.push("/drawer-layout/(drawer-tabs)/habits");
      else if (nextScreen === "analytics") router.push("/drawer-layout/(drawer-tabs)/analytics");
      else if (nextScreen === "ai-assistant") router.push("/drawer-layout/(drawer-tabs)/ai-assistant");
    },
    onSwipeRight: () => {
      const prevScreen = getNextScreen("tasks", "right");
      if (prevScreen === "index") router.push("/drawer-layout/(drawer-tabs)");
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "priority" | "title">("date");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      // Refresh when screen is focused
    }, [])
  );

  const filteredTasks = state.tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesCompletion = showCompleted ? task.completed : !task.completed;
    return matchesSearch && matchesPriority && matchesCompletion;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else {
      // Sort by date
      const dateA = new Date(a.dueDate || "9999-12-31").getTime();
      const dateB = new Date(b.dueDate || "9999-12-31").getTime();
      return dateA - dateB;
    }
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleToggleComplete = async (task: Task) => {
    await updateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    Alert.alert("Delete Tasks", `Delete ${selectedTasks.size} task(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const taskId of selectedTasks) {
            await deleteTask(taskId);
          }
          setSelectedTasks(new Set());
          setBatchMode(false);
        },
      },
    ]);
  };

  const handleBatchComplete = async () => {
    for (const taskId of selectedTasks) {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        await updateTask({
          ...task,
          completed: true,
          completedAt: new Date().toISOString(),
        });
      }
    }
    setSelectedTasks(new Set());
    setBatchMode(false);
  };

  return (
    <ScreenContainer
      className="p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/drawer-layout/task-modal")}
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
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
              Tasks
            </Text>
            {batchMode && (
              <Pressable
                onPress={() => {
                  setBatchMode(false);
                  setSelectedTasks(new Set());
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            )}
          </View>

          {/* Search Bar */}
          <TextInput
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: colors.foreground,
              marginBottom: 12,
            }}
            placeholderTextColor={colors.muted}
          />

          {/* Filter and Sort Controls */}
          <View style={{ marginBottom: 12, gap: 8 }}>
            {/* Filter Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {(["all", "high", "medium", "low"] as const).map((priority) => (
                <Pressable
                  key={priority}
                  onPress={() => setFilterPriority(priority)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: filterPriority === priority ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: filterPriority === priority ? "white" : colors.foreground,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {priority === "all" ? "All" : PRIORITY_LABELS[priority]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Sort and Toggle Controls */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* Sort Dropdown */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                {(["date", "priority", "title"] as const).map((sort) => (
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

              {/* Toggle Completed */}
              <Pressable
                onPress={() => setShowCompleted(!showCompleted)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: showCompleted ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: showCompleted ? "white" : colors.foreground,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {showCompleted ? "✓" : "○"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Batch Actions Bar */}
          {batchMode && selectedTasks.size > 0 && (
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
                {selectedTasks.size} selected
              </Text>
              <Pressable
                onPress={handleBatchComplete}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: colors.success,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>Complete</Text>
              </Pressable>
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
        </View>

        {/* Task List */}
        {sortedTasks.length > 0 ? (
          sortedTasks.map((item) => {
            const isSelected = selectedTasks.has(item.id);
            return (
              <Pressable
                key={item.id}
                onLongPress={() => {
                  setBatchMode(true);
                  toggleTaskSelection(item.id);
                }}
                onPress={() => {
                  if (batchMode) {
                    toggleTaskSelection(item.id);
                  } else {
                    router.push({ pathname: "/drawer-layout/task-modal", params: { taskId: item.id } });
                  }
                }}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected ? colors.primary + "20" : colors.surface,
                    borderLeftWidth: 4,
                    borderLeftColor: PRIORITY_COLORS[item.priority],
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? colors.primary : colors.surface,
                  },
                ]}
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
                        textDecorationLine: item.completed ? "line-through" : "none",
                        opacity: item.completed ? 0.6 : 1,
                      }}
                    >
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: 4, gap: 8 }}>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {PRIORITY_LABELS[item.priority]}
                      </Text>
                      {item.dueDate && (
                        <Text style={{ fontSize: 12, color: colors.muted }}>
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  {!batchMode && (
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <Pressable
                        onPress={() => handleToggleComplete(item)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.6 : 1,
                          padding: 8,
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: item.completed ? colors.success : colors.border,
                          backgroundColor: item.completed ? colors.success : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                        })}
                      >
                        {item.completed && <Text style={{ color: colors.background, fontSize: 14, fontWeight: "bold" }}>✓</Text>}
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteTask(item.id)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.6 : 1,
                          padding: 8,
                        })}
                      >
                        <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              {searchQuery || filterPriority !== "all" ? "No tasks found" : "No tasks yet"}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Create your first task to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
