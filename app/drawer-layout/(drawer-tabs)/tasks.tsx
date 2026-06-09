import { ScrollView, View, Text, Pressable, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { generateId, getTodayDate } from "@/lib/storage";
import { Task } from "@/lib/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [showCompleted, setShowCompleted] = useState(false);

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

  const handleToggleComplete = async (task: Task) => {
    await updateTask({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <ScreenContainer className="p-4">
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
            Tasks
          </Text>

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

          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
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

          {/* Toggle Completed */}
          <Pressable
            onPress={() => setShowCompleted(!showCompleted)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: showCompleted ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
              alignSelf: "flex-start",
              marginBottom: 12,
            })}
          >
            <Text
              style={{
                color: showCompleted ? "white" : colors.foreground,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {showCompleted ? "Showing Completed" : "Show Completed"}
            </Text>
          </Pressable>
        </View>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          filteredTasks.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: "/drawer-layout/task-modal", params: { taskId: item.id } })}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: 8,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: PRIORITY_COLORS[item.priority],
                },
              ]}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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
              </View>
            </Pressable>
          ))
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
