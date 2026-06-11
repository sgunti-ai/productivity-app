import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useRouter } from "expo-router";
import { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  recordSearch,
  getRecentSearches,
  getTopSearches,
  getSearchAnalytics,
  clearSearchHistory,
  SearchHistory,
  SearchAnalytics,
} from "@/lib/search-utils";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tasks" | "goals" | "habits">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [topSearches, setTopSearches] = useState<SearchHistory[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);

  // Advanced filters state
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<"all" | "today" | "week" | "month">("all");

  // Load search history and analytics on mount
  useEffect(() => {
    loadSearchData();
  }, []);

  const loadSearchData = async () => {
    const recent = await getRecentSearches(5);
    const top = await getTopSearches(5);
    const analyticsData = await getSearchAnalytics();

    setRecentSearches(recent);
    setTopSearches(top);
    setAnalytics(analyticsData);
  };

  // Global search across all items with advanced filters
  const searchResults = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    if (!query.trim()) {
      return { tasks: [], goals: [], habits: [] };
    }

    const getDateRange = () => {
      const today = new Date();
      const startDate = new Date();

      switch (filterDateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        default:
          return null;
      }

      return startDate;
    };

    const dateRange = getDateRange();

    const matchedTasks = state.tasks.filter((t) => {
      const matchesQuery =
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery);

      const matchesPriority = filterPriority.length === 0 || filterPriority.includes(t.priority);
      const matchesCategory = filterCategory.length === 0 || filterCategory.includes(t.category);
      const matchesStatus =
        filterStatus.length === 0 ||
        (filterStatus.includes("completed") && t.completed) ||
        (filterStatus.includes("incomplete") && !t.completed);

      const matchesDate =
        !dateRange || new Date(t.dueDate) >= dateRange;

      return matchesQuery && matchesPriority && matchesCategory && matchesStatus && matchesDate;
    });

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
  }, [query, state.tasks, state.goals, state.habits, filterPriority, filterCategory, filterStatus, filterDateRange]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      await recordSearch(searchQuery);
      // Reload analytics
      const analyticsData = await getSearchAnalytics();
      setAnalytics(analyticsData);
    }
  };

  const handleQuickSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    await recordSearch(searchQuery);
    const analyticsData = await getSearchAnalytics();
    setAnalytics(analyticsData);
  };

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

  const FilterChip = ({ label, active, onPress }: any) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: active ? colors.primary : colors.surface,
        marginRight: 8,
        marginBottom: 8,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: active ? "white" : colors.foreground,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
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
              onChangeText={handleSearch}
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

          {/* Advanced Filters Button */}
          <Pressable
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={({ pressed }) => ({
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: showAdvancedFilters ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            })}
          >
            <MaterialIcons
              name="tune"
              size={18}
              color={showAdvancedFilters ? "white" : colors.foreground}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: showAdvancedFilters ? "white" : colors.foreground,
              }}
            >
              Advanced Filters
            </Text>
          </Pressable>
        </View>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <View
            style={{
              marginBottom: 20,
              padding: 12,
              borderRadius: 12,
              backgroundColor: colors.surface,
            }}
          >
            {/* Priority Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>
                Priority
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["high", "medium", "low"].map((p) => (
                  <FilterChip
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    active={filterPriority.includes(p)}
                    onPress={() =>
                      setFilterPriority(
                        filterPriority.includes(p)
                          ? filterPriority.filter((x) => x !== p)
                          : [...filterPriority, p]
                      )
                    }
                  />
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>
                Category
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["Personal", "Work", "Health", "Finance", "Learning"].map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={filterCategory.includes(c)}
                    onPress={() =>
                      setFilterCategory(
                        filterCategory.includes(c)
                          ? filterCategory.filter((x) => x !== c)
                          : [...filterCategory, c]
                      )
                    }
                  />
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>
                Status
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["completed", "incomplete"].map((s) => (
                  <FilterChip
                    key={s}
                    label={s === "completed" ? "Completed" : "Incomplete"}
                    active={filterStatus.includes(s)}
                    onPress={() =>
                      setFilterStatus(
                        filterStatus.includes(s)
                          ? filterStatus.filter((x) => x !== s)
                          : [...filterStatus, s]
                      )
                    }
                  />
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>
                Date Range
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["all", "today", "week", "month"].map((d) => (
                  <FilterChip
                    key={d}
                    label={d.charAt(0).toUpperCase() + d.slice(1)}
                    active={filterDateRange === d}
                    onPress={() => setFilterDateRange(d as any)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* No Query State - Show Recent & Top Searches */}
        {!query.trim() ? (
          <>
            {/* Analytics Summary */}
            {analytics && (
              <View
                style={{
                  marginBottom: 20,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>
                    {analytics.totalSearches}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Total Searches</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>
                    {analytics.uniqueQueries}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Unique Queries</Text>
                </View>
              </View>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    ⏱️ Recent Searches
                  </Text>
                  <Pressable
                    onPress={async () => {
                      await clearSearchHistory();
                      setRecentSearches([]);
                      setTopSearches([]);
                      setAnalytics(null);
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>Clear</Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {recentSearches.map((search) => (
                    <Pressable
                      key={search.query}
                      onPress={() => handleQuickSearch(search.query)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        marginRight: 8,
                        marginBottom: 8,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                        {search.query}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Top Searches */}
            {topSearches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
                  🔥 Trending Searches
                </Text>
                {topSearches.map((search, index) => (
                  <Pressable
                    key={search.query}
                    onPress={() => handleQuickSearch(search.query)}
                    style={({ pressed }) => ({
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: colors.surface,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
                        #{index + 1}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: "500" }}>
                        {search.query}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {search.count} {search.count === 1 ? "search" : "searches"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Empty State */}
            {recentSearches.length === 0 && topSearches.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>🔎</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                  Start Searching
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
                  Search across all your tasks, goals, and habits
                </Text>
              </View>
            )}
          </>
        ) : totalResults === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              No Results Found
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Try a different search term or adjust filters
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
