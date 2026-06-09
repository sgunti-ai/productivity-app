import { ScrollView, View, Text, Pressable, RefreshControl, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function GoalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, deleteGoal } = useApp();
  const [filterStatus, setFilterStatus] = useState<"active" | "completed" | "all">("active");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"progress" | "deadline" | "title">("progress");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());

  const filteredGoals = state.goals.filter((goal) => {
    if (filterStatus === "all") return true;
    return goal.status === filterStatus;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    if (sortBy === "progress") {
      return b.progress - a.progress;
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else {
      // Sort by deadline
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return dateA - dateB;
    }
  });

  const activeGoals = state.goals.filter((g) => g.status === "active").length;
  const completedGoals = state.goals.filter((g) => g.status === "completed").length;
  const avgProgress = state.goals.length > 0 ? Math.round(state.goals.reduce((sum, g) => sum + g.progress, 0) / state.goals.length) : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = () => {
    Alert.alert("Delete Goals", `Delete ${selectedGoals.size} goal(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const goalId of selectedGoals) {
            await deleteGoal(goalId);
          }
          setSelectedGoals(new Set());
          setBatchMode(false);
        },
      },
    ]);
  };

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            Goals
          </Text>
          {batchMode && (
            <Pressable
              onPress={() => {
                setBatchMode(false);
                setSelectedGoals(new Set());
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

        {/* Filter and Sort Controls */}
        <View style={{ marginBottom: 12, gap: 8 }}>
          {/* Status Filter Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 8,
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

          {/* Sort Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(["progress", "deadline", "title"] as const).map((sort) => (
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
        {batchMode && selectedGoals.size > 0 && (
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
              {selectedGoals.size} selected
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

        {/* Goals List */}
        {sortedGoals.length > 0 ? (
          sortedGoals.map((item) => {
            const isSelected = selectedGoals.has(item.id);
            return (
              <Pressable
                key={item.id}
                onLongPress={() => {
                  setBatchMode(true);
                  toggleGoalSelection(item.id);
                }}
                onPress={() => {
                  if (batchMode) {
                    toggleGoalSelection(item.id);
                  } else {
                    router.push({ pathname: "/drawer-layout/goal-modal", params: { goalId: item.id } });
                  }
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: 12,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: isSelected ? colors.primary + "20" : colors.surface,
                  borderWidth: isSelected ? 1 : 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                })}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
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
                        marginTop: 2,
                      }}
                    >
                      {isSelected && <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>}
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                      {item.category}
                    </Text>
                  </View>
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
          })
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              No {filterStatus === "all" ? "" : filterStatus} goals yet
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Create your first goal to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
