import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tasks" | "goals" | "habits">("all");

  // Global search across all items
  const searchResults = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    if (!query.trim()) {
      return { tasks: [], goals: [], habits: [] };
    }

    const matchedTasks = state.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
    );

    const matchedGoals = state.goals.filter(
      (g) =>
        g.title.toLowerCase().includes(lowerQuery) ||
        g.description?.toLowerCase().includes(lowerQuery)
    );

    const matchedHabits = state.habits.filter(
      (h) =>
        h.title.toLowerCase().includes(lowerQuery) ||
        h.description?.toLowerCase().includes(lowerQuery)
    );

    return { tasks: matchedTasks, goals: matchedGoals, habits: matchedHabits };
  }, [query, state.tasks, state.goals, state.habits]);

  const totalResults =
    searchResults.tasks.length + searchResults.goals.length + searchResults.habits.length;

  const TaskResultItem = ({ item }: any) => (
    <Pressable
      onPress={() => router.push({ pathname: "/task-modal", params: { taskId: item.id } })}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor:
          item.priority === "high" ? "#EF4444" : item.priority === "medium" ? "#F59E0B" : "#22C55E",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 6,
              textDecorationLine: item.completed ? "line-through" : "none",
            }}
          >
            📋 {item.title}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor:
                  item.priority === "high"
                    ? colors.error
                    : item.priority === "medium"
                      ? colors.warning
                      : colors.success,
              }}
            >
              <Text style={{ fontSize: 10, color: "white", fontWeight: "600" }}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: colors.muted }}>{item.category}</Text>
            <Text style={{ fontSize: 10, color: colors.muted }}>
              {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>
        {item.completed && <Text style={{ fontSize: 16 }}>✓</Text>}
      </View>
    </Pressable>
  );

  const GoalResultItem = ({ item }: any) => (
    <Pressable
      onPress={() => router.push("/drawer-layout/(drawer-tabs)/goals")}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: 10,
        borderTopWidth: 3,
        borderTopColor: colors.primary,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 8,
        }}
      >
        🎯 {item.title}
      </Text>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.border,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${item.progress}%`,
            backgroundColor: colors.primary,
            borderRadius: 3,
          }}
        />
      </View>
      <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
        {item.progress}% • {item.status}
      </Text>
    </Pressable>
  );

  const HabitResultItem = ({ item }: any) => (
    <Pressable
      onPress={() => router.push("/drawer-layout/(drawer-tabs)/habits")}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.foreground,
          marginBottom: 6,
        }}
      >
        🔄 {item.title}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>Streak: {item.currentStreak || 0}</Text>
      </View>
    </Pressable>
  );

  const TabButton = ({ label, value }: any) => (
    <Pressable
      onPress={() => setActiveTab(value)}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: activeTab === value ? 3 : 0,
        borderBottomColor: activeTab === value ? colors.primary : "transparent",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: activeTab === value ? "600" : "500",
          color: activeTab === value ? colors.primary : colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
            🔍 Global Search
          </Text>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              backgroundColor: colors.surface,
              gap: 8,
            }}
          >
            <MaterialIcons name="search" size={20} color={colors.muted} />
            <TextInput
              placeholder="Search tasks, goals, habits..."
              value={query}
              onChangeText={setQuery}
              style={{
                flex: 1,
                paddingVertical: 12,
                color: colors.foreground,
                fontSize: 14,
              }}
              placeholderTextColor={colors.muted}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <MaterialIcons name="close" size={20} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* No Query State */}
        {!query.trim() ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔎</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Start Searching
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Search across all your tasks, goals, and habits
            </Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              No Results Found
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <>
            {/* Tab Navigation */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <TabButton label={`All (${totalResults})`} value="all" />
              <TabButton label={`Tasks (${searchResults.tasks.length})`} value="tasks" />
              <TabButton label={`Goals (${searchResults.goals.length})`} value="goals" />
              <TabButton label={`Habits (${searchResults.habits.length})`} value="habits" />
            </View>

            {/* Results */}
            {(activeTab === "all" || activeTab === "tasks") && searchResults.tasks.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                {activeTab === "all" && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, marginBottom: 12 }}>
                    📋 Tasks ({searchResults.tasks.length})
                  </Text>
                )}
                {searchResults.tasks.map((task) => (
                  <TaskResultItem key={task.id} item={task} />
                ))}
              </View>
            )}

            {(activeTab === "all" || activeTab === "goals") && searchResults.goals.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                {activeTab === "all" && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, marginBottom: 12 }}>
                    🎯 Goals ({searchResults.goals.length})
                  </Text>
                )}
                {searchResults.goals.map((goal) => (
                  <GoalResultItem key={goal.id} item={goal} />
                ))}
              </View>
            )}

            {(activeTab === "all" || activeTab === "habits") && searchResults.habits.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                {activeTab === "all" && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, marginBottom: 12 }}>
                    🔄 Habits ({searchResults.habits.length})
                  </Text>
                )}
                {searchResults.habits.map((habit) => (
                  <HabitResultItem key={habit.id} item={habit} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
