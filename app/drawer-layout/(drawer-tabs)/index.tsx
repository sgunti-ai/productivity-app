import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { getTodayDate, getNextDays, formatDate } from "@/lib/storage";
import { useState, useEffect } from "react";
import { useSwipeNavigation, getNextScreen } from "@/hooks/use-swipe-navigation";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const colors = useColors();
  const { state } = useApp();
  const { state: authState } = useAuth();
  const router = useRouter();
  const [completedToday, setCompletedToday] = useState(0);

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipeLeft: () => {
      const nextScreen = getNextScreen("index", "left");
      if (nextScreen === "tasks") router.push("/drawer-layout/(drawer-tabs)/tasks");
      else if (nextScreen === "calendar") router.push("/drawer-layout/(drawer-tabs)/calendar");
      else if (nextScreen === "goals") router.push("/drawer-layout/(drawer-tabs)/goals");
      else if (nextScreen === "habits") router.push("/drawer-layout/(drawer-tabs)/habits");
      else if (nextScreen === "analytics") router.push("/drawer-layout/(drawer-tabs)/analytics");
      else if (nextScreen === "ai-assistant") router.push("/drawer-layout/(drawer-tabs)/ai-assistant");
    },
    onSwipeRight: () => {
      // No previous screen from home
    },
  });

  useEffect(() => {
    const today = getTodayDate();
    const completed = state.tasks.filter((t) => t.dueDate === today && t.completed).length;
    setCompletedToday(completed);
  }, [state.tasks]);

  const today = getTodayDate();
  const todayTasks = state.tasks.filter((t) => t.dueDate === today && !t.completed);
  const nextDays = getNextDays(3).slice(1);
  const upcomingTasks = state.tasks.filter((t) => nextDays.includes(t.dueDate) && !t.completed);
  const activeGoals = state.goals.filter((g) => g.status === "active");

  const totalTasksToday = state.tasks.filter((t) => t.dueDate === today).length;
  const completionRate = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0;

  return (
    <ScreenContainer
      className="p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground }}>
            Welcome Back, {authState.user?.name?.split(" ")[0]}!
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>

        {/* Daily Stats */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: colors.surface,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
                {completionRate}%
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Today's Progress
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: colors.surface,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.success,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
                {completedToday}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Tasks Done
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              backgroundColor: colors.surface,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.warning,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
                {activeGoals.length}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Active Goals
            </Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
              Today's Tasks
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {todayTasks.length} pending
            </Text>
          </View>

          <FlatList
            data={todayTasks.slice(0, 3)}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor:
                    item.priority === "high"
                      ? "#EF4444"
                      : item.priority === "medium"
                        ? "#F59E0B"
                        : "#22C55E",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  {item.title}
                </Text>
                {item.dueTime && (
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    {item.dueTime}
                  </Text>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 16 }}>
                No tasks for today. Great job!
              </Text>
            }
          />
        </View>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              Upcoming
            </Text>

            <FlatList
              data={upcomingTasks.slice(0, 3)}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, flex: 1 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {formatDate(item.dueDate)}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              Active Goals
            </Text>

            <FlatList
              data={activeGoals.slice(0, 2)}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                    {item.title}
                  </Text>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
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
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>
                    {item.progress}% complete
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {todayTasks.length === 0 && upcomingTasks.length === 0 && activeGoals.length === 0 && (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: colors.muted }}>
              All caught up!
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
              Create a task or goal to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
