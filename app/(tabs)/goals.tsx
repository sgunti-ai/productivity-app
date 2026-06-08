import { ScrollView, View, Text, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function GoalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [filterStatus, setFilterStatus] = useState<"active" | "completed" | "all">("active");

  const filteredGoals = state.goals.filter((goal) => {
    if (filterStatus === "all") return true;
    return goal.status === filterStatus;
  });

  const activeGoals = state.goals.filter((g) => g.status === "active").length;
  const completedGoals = state.goals.filter((g) => g.status === "completed").length;
  const avgProgress = state.goals.length > 0 ? Math.round(state.goals.reduce((sum, g) => sum + g.progress, 0) / state.goals.length) : 0;

  const renderGoalItem = ({ item }: { item: typeof state.goals[0] }) => (
    <Pressable
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, flex: 1 }}>
            {item.title}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: item.status === "active" ? colors.primary : colors.success,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "600", color: "white" }}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {item.category}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>Progress</Text>
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
            {item.progress}%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${item.progress}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>

      {/* Deadline */}
      <Text style={{ fontSize: 12, color: colors.muted }}>
        Deadline: {new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-4">
      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/drawer-layout/goal-modal")}
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
        Goals
      </Text>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.primary }}>
            {activeGoals}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            Active
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.success }}>
            {completedGoals}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            Completed
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.primary }}>
            {avgProgress}%
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            Avg Progress
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 8,
        }}
      >
        {(["active", "completed", "all"] as const).map((status) => (
          <Pressable
            key={status}
            onPress={() => setFilterStatus(status)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: filterStatus === status ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
              alignItems: "center",
            })}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: filterStatus === status ? "white" : colors.foreground,
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Goals List */}
      <FlatList
        data={filteredGoals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              No {filterStatus === "all" ? "" : filterStatus} goals yet
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Create your first goal to get started
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
