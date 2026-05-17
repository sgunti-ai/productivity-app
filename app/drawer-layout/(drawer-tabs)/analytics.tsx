import { ScrollView, View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { BarChart, LineChart, ProgressCircle } from "@/components/charts/productivity-chart";
import { getTodayDate } from "@/lib/storage";

export default function AnalyticsScreen() {
  const colors = useColors();
  const { state } = useApp();

  // Calculate weekly task completion
  const getWeeklyData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTasks = state.tasks.filter((t) => t.dueDate === dateStr);
      const completedCount = dayTasks.filter((t) => t.completed).length;

      weekData.push({
        label: days[date.getDay()],
        value: dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0,
      });
    }

    return weekData;
  };

  // Calculate habit completion for last 7 days
  const getHabitWeeklyData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completedCount = state.habits.filter((h) => h.completedDates.includes(dateStr)).length;

      weekData.push({
        label: days[date.getDay()],
        value: completedCount,
      });
    }

    return weekData;
  };

  // Calculate monthly task completion
  const getMonthlyData = () => {
    const monthData = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const weekTasks = state.tasks.filter(
        (t) => t.dueDate >= weekStartStr && t.dueDate <= weekEndStr
      );
      const completedCount = weekTasks.filter((t) => t.completed).length;

      monthData.unshift({
        label: `W${4 - i}`,
        value: weekTasks.length > 0 ? Math.round((completedCount / weekTasks.length) * 100) : 0,
      });
    }

    return monthData;
  };

  // Calculate overall statistics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeGoals = state.goals.filter((g) => g.status === "active").length;
  const completedGoals = state.goals.filter((g) => g.status === "completed").length;

  const totalHabits = state.habits.length;
  const today = getTodayDate();
  const completedHabitsToday = state.habits.filter((h) => h.completedDates.includes(today)).length;

  const weeklyData = getWeeklyData();
  const habitWeeklyData = getHabitWeeklyData();
  const monthlyData = getMonthlyData();

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 24 }}>
          Analytics
        </Text>

        {/* Overview Stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.primary }}>
              {completionRate}%
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              Overall Completion
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.success }}>
              {completedTasks}/{totalTasks}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              Tasks Completed
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.warning }}>
              {completedHabitsToday}/{totalHabits}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              Habits Today
            </Text>
          </View>
        </View>

        {/* Weekly Task Completion */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Weekly Task Completion %
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
            <BarChart data={weeklyData} maxValue={100} height={180} />
          </View>
        </View>

        {/* Weekly Habit Completion */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Weekly Habit Completions
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
            <LineChart data={habitWeeklyData} maxValue={totalHabits || 5} height={180} />
          </View>
        </View>

        {/* Monthly Task Completion */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Monthly Task Completion %
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
            <BarChart data={monthlyData} maxValue={100} height={160} />
          </View>
        </View>

        {/* Goal Statistics */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Goal Progress
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <ProgressCircle
                percentage={(completedGoals / (activeGoals + completedGoals)) * 100 || 0}
                size={100}
                strokeWidth={6}
                label="Completion"
              />
            </View>
            <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                  Active Goals
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.primary }}>
                  {activeGoals}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                  Completed
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.success }}>
                  {completedGoals}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Productivity Tips */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white", marginBottom: 8 }}>
            💡 Productivity Tip
          </Text>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 20 }}>
            {completionRate >= 80
              ? "You're doing amazing! Keep up the momentum and maintain your streak!"
              : completionRate >= 60
              ? "Great progress! Try to focus on completing more tasks each day."
              : completionRate >= 40
              ? "You're on the right track. Set smaller, achievable goals."
              : "Start small and build your habits gradually. Every step counts!"}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
