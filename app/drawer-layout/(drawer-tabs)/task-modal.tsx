import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { generateId, getTodayDate, Task } from "@/lib/storage";

export default function TaskModalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addTask, updateTask, state } = useApp();
  const params = useLocalSearchParams();
  const taskId = params.taskId as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState(getTodayDate());
  const [dueTime, setDueTime] = useState("");
  const [category, setCategory] = useState("Personal");
  const [repeat, setRepeat] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [goalId, setGoalId] = useState<string | undefined>(undefined);

  const categories = ["Personal", "Work", "Health", "Finance", "Learning"];
  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const repeats: ("none" | "daily" | "weekly" | "monthly")[] = ["none", "daily", "weekly", "monthly"];

  useEffect(() => {
    if (taskId) {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setDueDate(task.dueDate);
        setDueTime(task.dueTime || "");
        setCategory(task.category);
        setRepeat(task.repeat);
        setGoalId(task.goalId);
      }
    }
  }, [taskId, state.tasks]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    const task: Task = {
      id: taskId || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      category,
      completed: taskId ? state.tasks.find((t) => t.id === taskId)?.completed || false : false,
      repeat,
      goalId,
      createdAt: taskId ? state.tasks.find((t) => t.id === taskId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (taskId) {
        await updateTask(task);
      } else {
        await addTask(task);
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save task");
    }
  };

  const PickerButton = ({
    label,
    value,
    options,
    onSelect,
  }: {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 8,
              backgroundColor: value === option ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              style={{
                color: value === option ? "white" : colors.foreground,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            {taskId ? "Edit Task" : "New Task"}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 24, color: colors.foreground }}>✕</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Task Title *
          </Text>
          <TextInput
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.foreground,
              fontSize: 16,
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Description
          </Text>
          <TextInput
            placeholder="Add task details (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.foreground,
              fontSize: 14,
              textAlignVertical: "top",
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Priority */}
        <PickerButton
          label="Priority"
          value={priority}
          options={priorities}
          onSelect={(value) => setPriority(value as "high" | "medium" | "low")}
        />

        {/* Category */}
        <PickerButton
          label="Category"
          value={category}
          options={categories}
          onSelect={setCategory}
        />

        {/* Due Date */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Due Date
          </Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.foreground,
              fontSize: 14,
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Due Time */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Due Time (optional)
          </Text>
          <TextInput
            placeholder="HH:mm"
            value={dueTime}
            onChangeText={setDueTime}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.foreground,
              fontSize: 14,
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Repeat */}
        <PickerButton
          label="Repeat"
          value={repeat}
          options={repeats}
          onSelect={(value) => setRepeat(value as "none" | "daily" | "weekly" | "monthly")}
        />

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 20 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
              alignItems: "center",
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
              alignItems: "center",
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
              {taskId ? "Update" : "Create"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
