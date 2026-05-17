import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { generateId, Habit } from "@/lib/storage";

const HABIT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
];

export default function HabitModalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addHabit, updateHabit, state } = useApp();
  const params = useLocalSearchParams();
  const habitId = params.habitId as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  const categories = ["Personal", "Work", "Health", "Finance", "Learning"];
  const frequencies: ("daily" | "weekly" | "custom")[] = ["daily", "weekly", "custom"];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (habitId) {
      const habit = state.habits.find((h) => h.id === habitId);
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || "");
        setCategory(habit.category);
        setFrequency(habit.frequency);
        setSelectedColor(habit.color);
        setDaysOfWeek(habit.daysOfWeek || []);
      }
    }
  }, [habitId, state.habits]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    if (frequency === "weekly" && daysOfWeek.length === 0) {
      Alert.alert("Error", "Please select at least one day for weekly habits");
      return;
    }

    const habit: Habit = {
      id: habitId || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      frequency,
      daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
      color: selectedColor,
      completedDates: habitId ? state.habits.find((h) => h.id === habitId)?.completedDates || [] : [],
      createdAt: habitId ? state.habits.find((h) => h.id === habitId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (habitId) {
        await updateHabit(habit);
      } else {
        await addHabit(habit);
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save habit");
    }
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
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
            {habitId ? "Edit Habit" : "New Habit"}
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
            Habit Title *
          </Text>
          <TextInput
            placeholder="Enter habit title"
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
            placeholder="Why this habit matters (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
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

        {/* Category */}
        <PickerButton
          label="Category"
          value={category}
          options={categories}
          onSelect={setCategory}
        />

        {/* Frequency */}
        <PickerButton
          label="Frequency"
          value={frequency}
          options={frequencies}
          onSelect={(value) => setFrequency(value as "daily" | "weekly" | "custom")}
        />

        {/* Days of Week (for weekly habits) */}
        {frequency === "weekly" && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Select Days *
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {dayLabels.map((day, index) => (
                <Pressable
                  key={index}
                  onPress={() => toggleDay(index)}
                  style={({ pressed }) => ({
                    width: "22%",
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: daysOfWeek.includes(index) ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                    alignItems: "center",
                  })}
                >
                  <Text
                    style={{
                      color: daysOfWeek.includes(index) ? "white" : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Color Selection */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Habit Color
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {HABIT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: color,
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: colors.foreground,
                })}
              />
            ))}
          </View>
        </View>

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
              {habitId ? "Update" : "Create"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
