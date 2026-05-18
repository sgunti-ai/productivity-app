import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { SearchFilters, defaultFilters, filterTasks, getDateRangeEnd, getDateRangeStart } from "@/lib/search";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ScrollView, FlatList, Modal } from "react-native";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredTasks = useMemo(() => filterTasks(state.tasks, filters), [state.tasks, filters]);

  const handleQueryChange = (query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  };

  const togglePriority = (priority: "high" | "medium" | "low") => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleStatus = (status: "completed" | "incomplete") => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
    }));
  };

  const toggleDateRange = (range: "today" | "week" | "month" | "custom" | "all") => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];
  const categories = ["Personal", "Work", "Health", "Finance", "Learning"];
  const statuses: ("completed" | "incomplete")[] = ["completed", "incomplete"];
  const dateRanges: ("today" | "week" | "month" | "custom" | "all")[] = ["today", "week", "month", "all"];

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
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

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
            Search Tasks
          </Text>

          {/* Search Bar */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.muted, marginRight: 8 }}>🔍</Text>
              <TextInput
                placeholder="Search tasks..."
                value={filters.query}
                onChangeText={handleQueryChange}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  color: colors.foreground,
                  fontSize: 14,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: showFilters ? colors.primary : colors.surface,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 16 }}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {/* Active Filters Display */}
        {(filters.priorities.length > 0 ||
          filters.categories.length > 0 ||
          filters.status.length > 0 ||
          filters.dateRange !== "all") && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted }}>Active Filters</Text>
              <Pressable
                onPress={clearFilters}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>Clear All</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {filters.priorities.map((p) => (
                <FilterChip key={p} label={`Priority: ${p}`} active onPress={() => togglePriority(p)} />
              ))}
              {filters.categories.map((c) => (
                <FilterChip key={c} label={c} active onPress={() => toggleCategory(c)} />
              ))}
              {filters.status.map((s) => (
                <FilterChip key={s} label={s === "completed" ? "Done" : "Todo"} active onPress={() => toggleStatus(s)} />
              ))}
              {filters.dateRange !== "all" && (
                <FilterChip
                  label={`${filters.dateRange.charAt(0).toUpperCase()}${filters.dateRange.slice(1)}`}
                  active
                  onPress={() => toggleDateRange("all")}
                />
              )}
            </View>
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <View style={{ marginBottom: 20, padding: 12, borderRadius: 12, backgroundColor: colors.surface }}>
            {/* Priority Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>Priority</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {priorities.map((p) => (
                  <FilterChip
                    key={p}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                    active={filters.priorities.includes(p)}
                    onPress={() => togglePriority(p)}
                  />
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {categories.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={filters.categories.includes(c)}
                    onPress={() => toggleCategory(c)}
                  />
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>Status</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {statuses.map((s) => (
                  <FilterChip
                    key={s}
                    label={s === "completed" ? "Completed" : "Incomplete"}
                    active={filters.status.includes(s)}
                    onPress={() => toggleStatus(s)}
                  />
                ))}
              </View>
            </View>

            {/* Date Range Filter */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 }}>Date Range</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {dateRanges.map((d) => (
                  <FilterChip
                    key={d}
                    label={d.charAt(0).toUpperCase() + d.slice(1)}
                    active={filters.dateRange === d}
                    onPress={() => toggleDateRange(d)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, marginBottom: 12 }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? "result" : "results"}
          </Text>

          {filteredTasks.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                No tasks found
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push({ pathname: "/task-modal", params: { taskId: item.id } })}
                  style={({ pressed }) => ({
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    marginBottom: 8,
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
                          marginBottom: 4,
                          textDecorationLine: item.completed ? "line-through" : "none",
                        }}
                      >
                        {item.title}
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
              )}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
