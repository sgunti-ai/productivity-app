import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { generateId, getTodayDate, Goal } from "@/lib/storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function GoalModalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addGoal, updateGoal, state } = useApp();
  const params = useLocalSearchParams();
  const goalId = params.goalId as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "on_hold">("active");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ["Personal", "Work", "Health", "Finance", "Learning"];
  const statuses: ("active" | "completed" | "on_hold")[] = ["active", "completed", "on_hold"];

  useEffect(() => {
    if (goalId) {
      const goal = state.goals.find((g) => g.id === goalId);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description);
        setCategory(goal.category);
        setDeadline(goal.deadline);
        setStatus(goal.status);
      }
    } else {
      setDeadline(getTodayDate());
    }
  }, [goalId, state.goals]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a goal title");
      return;
    }

    if (!deadline) {
      Alert.alert("Error", "Please set a deadline");
      return;
    }

    const goal: Goal = {
      id: goalId || generateId(),
      title: title.trim(),
      description: description.trim(),
      category,
      deadline,
      status,
      progress: goalId ? state.goals.find((g) => g.id === goalId)?.progress || 0 : 0,
      milestones: goalId ? state.goals.find((g) => g.id === goalId)?.milestones || [] : [],
      createdAt: goalId ? state.goals.find((g) => g.id === goalId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (goalId) {
        await updateGoal(goal);
      } else {
        await addGoal(goal);
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save goal");
    }
  };

  // Generate dates for the next 365 days
  const generateDateList = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
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

  const dateList = generateDateList();

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            {goalId ? "Edit Goal" : "New Goal"}
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
            Goal Title *
          </Text>
          <TextInput
            placeholder="Enter goal title"
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
            placeholder="Describe your goal"
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

        {/* Category */}
        <PickerButton
          label="Category"
          value={category}
          options={categories}
          onSelect={setCategory}
        />

        {/* Deadline */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            Deadline *
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => ({
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.8 : 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <Text style={{ color: deadline ? colors.foreground : colors.muted, fontSize: 14 }}>
              {deadline || "Tap to select date"}
            </Text>
            <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Status */}
        <PickerButton
          label="Status"
          value={status}
          options={statuses}
          onSelect={(value) => setStatus(value as "active" | "completed" | "on_hold")}
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
              {goalId ? "Update" : "Create"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
              marginTop: 100,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
                Select Deadline
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Date List */}
            <FlatList
              data={dateList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setDeadline(item);
                    setShowDatePicker(false);
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.border,
                    backgroundColor: deadline === item ? colors.surface : colors.background,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: deadline === item ? colors.primary : colors.foreground,
                      fontWeight: deadline === item ? "600" : "400",
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
