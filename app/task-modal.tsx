import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { generateId, getTodayDate, Task } from "@/lib/storage";
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal } from "react-native";

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = ["Personal", "Work", "Health", "Finance", "Learning"];
  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const repeats: ("none" | "daily" | "weekly" | "monthly")[] = ["none", "daily", "weekly", "monthly"];
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

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

  const handleDateChange = (offset: number) => {
    const date = new Date(dueDate);
    date.setDate(date.getDate() + offset);
    setDueDate(date.toISOString().split("T")[0]);
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

        {/* Due Date Picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Due Date
          </Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Pressable
              onPress={() => handleDateChange(-1)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 18, color: colors.primary }}>−</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => ({
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: colors.foreground, fontSize: 14, textAlign: "center" }}>
                {new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleDateChange(1)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 18, color: colors.primary }}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>Select Date</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={{ fontSize: 18, color: colors.primary }}>Done</Text>
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {Array.from({ length: 365 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = dateStr === dueDate;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setDueDate(dateStr);
                        setShowDatePicker(false);
                      }}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ color: isSelected ? "white" : colors.foreground, fontSize: 14 }}>
                        {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Due Time Picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Due Time (optional)
          </Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={({ pressed }) => ({
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: dueTime ? colors.foreground : colors.muted, fontSize: 14 }}>
              {dueTime || "Select time"}
            </Text>
          </Pressable>
        </View>

        {/* Time Picker Modal */}
        <Modal visible={showTimePicker} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>Select Time</Text>
                <Pressable onPress={() => setShowTimePicker(false)}>
                  <Text style={{ fontSize: 18, color: colors.primary }}>Done</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                <ScrollView style={{ flex: 1, maxHeight: 200 }}>
                  {hours.map((hour) => (
                    <Pressable
                      key={hour}
                      onPress={() => setDueTime(`${hour}:${dueTime.split(":")[1] || "00"}`)}
                      style={({ pressed }) => ({
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: dueTime.startsWith(hour) ? colors.primary : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ color: dueTime.startsWith(hour) ? "white" : colors.foreground, textAlign: "center" }}>
                        {hour}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>:</Text>
                <ScrollView style={{ flex: 1, maxHeight: 200 }}>
                  {minutes.map((minute) => (
                    <Pressable
                      key={minute}
                      onPress={() => setDueTime(`${dueTime.split(":")[0] || "00"}:${minute}`)}
                      style={({ pressed }) => ({
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: dueTime.endsWith(minute) ? colors.primary : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ color: dueTime.endsWith(minute) ? "white" : colors.foreground, textAlign: "center" }}>
                        {minute}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <Pressable
                onPress={() => setDueTime("")}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: colors.error,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>Clear Time</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Repeat */}
        <PickerButton
          label="Repeat"
          value={repeat}
          options={repeats}
          onSelect={(value) => setRepeat(value as "none" | "daily" | "weekly" | "monthly")}
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
            marginBottom: 24,
          })}
        >
          <Text style={{ color: "white", textAlign: "center", fontSize: 16, fontWeight: "600" }}>
            {taskId ? "Update Task" : "Create Task"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
