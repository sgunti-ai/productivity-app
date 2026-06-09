import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSwipeNavigation, getNextScreen } from "@/hooks/use-swipe-navigation";

export default function AIAssistantScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();

  const { handleTouchStart, handleTouchEnd } = useSwipeNavigation({
    onSwipeLeft: () => {
      // No more screens to the left
    },
    onSwipeRight: () => {
      const prevScreen = getNextScreen("ai-assistant", "right");
      if (prevScreen === "analytics") router.push("/drawer-layout/(drawer-tabs)/analytics");
      else if (prevScreen === "habits") router.push("/drawer-layout/(drawer-tabs)/habits");
      else if (prevScreen === "goals") router.push("/drawer-layout/(drawer-tabs)/goals");
      else if (prevScreen === "calendar") router.push("/drawer-layout/(drawer-tabs)/calendar");
      else if (prevScreen === "tasks") router.push("/drawer-layout/(drawer-tabs)/tasks");
      else if (prevScreen === "index") router.push("/drawer-layout/(drawer-tabs)");
    },
  });
  const [activeTab, setActiveTab] = useState<"tips" | "insights" | "decompose">("tips");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  const loadTabContent = async () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      switch (activeTab) {
        case "tips":
          setContent(generateProductivityTips());
          break;
        case "insights":
          setContent(generatePersonalizedInsights());
          break;
        case "decompose":
          setContent(generateGoalDecomposition());
          break;
      }
      setLoading(false);
    }, 500);
  };

  const generateProductivityTips = () => {
    const tips = [
      "🎯 Focus on one task at a time. Multitasking reduces productivity by up to 40%.",
      "⏱️ Use the Pomodoro Technique: 25 minutes of focused work, 5 minutes rest.",
      "📅 Schedule your most important tasks during your peak energy hours.",
      "✅ Break large goals into smaller, manageable tasks.",
      "🌙 Maintain consistent sleep schedule for better focus and memory.",
      "💧 Stay hydrated - dehydration affects cognitive performance.",
      "🚶 Take regular breaks to avoid burnout and maintain motivation.",
      "📱 Minimize distractions by turning off notifications during work.",
    ];
    return tips.join("\n\n");
  };

  const generatePersonalizedInsights = () => {
    const completedTasks = state.tasks.filter((t) => t.completed).length;
    const totalTasks = state.tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeGoals = state.goals.filter((g) => g.status === "active").length;
    const completedGoals = state.goals.filter((g) => g.status === "completed").length;

    const insights = [
      `📊 Task Completion Rate: ${completionRate}%`,
      `✅ Completed Tasks: ${completedTasks} out of ${totalTasks}`,
      `🎯 Active Goals: ${activeGoals}`,
      `🏆 Completed Goals: ${completedGoals}`,
      completionRate >= 80
        ? "🌟 Excellent work! You're maintaining a high completion rate."
        : completionRate >= 60
          ? "👍 Good progress! Keep pushing to improve your completion rate."
          : "💪 There's room for improvement. Try breaking tasks into smaller steps.",
      `📈 Most Active Category: ${getMostActiveCategory()}`,
      `⏰ Average Tasks per Day: ${getAverageTasksPerDay()}`,
    ];
    return insights.join("\n\n");
  };

  const generateGoalDecomposition = () => {
    const activeGoals = state.goals.filter((g) => g.status === "active");

    if (activeGoals.length === 0) {
      return "No active goals to decompose. Create a goal to get started!";
    }

    const goal = activeGoals[0];
    const decomposition = [
      `Goal: ${goal.title}`,
      `Category: ${goal.category}`,
      `Deadline: ${goal.deadline}`,
      `\nSuggested Breakdown:`,
      `1. Define the end state - What does success look like?`,
      `2. Identify key milestones - Break the goal into 3-5 major phases`,
      `3. Create actionable tasks - Each milestone should have 2-4 specific tasks`,
      `4. Set deadlines - Distribute milestones evenly across time`,
      `5. Track progress - Review weekly and adjust as needed`,
      `\nRelated Tasks: ${state.tasks.filter((t) => t.goalId === goal.id).length}`,
    ];
    return decomposition.join("\n\n");
  };

  const getMostActiveCategory = () => {
    const categories: Record<string, number> = {};
    state.tasks.forEach((task) => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "N/A";
  };

  const getAverageTasksPerDay = () => {
    if (state.tasks.length === 0) return "0";
    const days = 7; // Last 7 days
    return (state.tasks.length / days).toFixed(1);
  };

  const TabButton = ({ tab, label }: { tab: "tips" | "insights" | "decompose"; label: string }) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: activeTab === tab ? 3 : 0,
        borderBottomColor: activeTab === tab ? colors.primary : "transparent",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 14,
          fontWeight: activeTab === tab ? "600" : "500",
          color: activeTab === tab ? colors.primary : colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer
      className="p-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Tab Navigation */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <TabButton tab="tips" label="💡 Tips" />
          <TabButton tab="insights" label="📊 Insights" />
          <TabButton tab="decompose" label="🎯 Decompose" />
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1, padding: 16 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.muted, fontSize: 14 }}>Loading content...</Text>
            </View>
          ) : (
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: colors.foreground,
              }}
            >
              {content}
            </Text>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
