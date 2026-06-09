import { ScrollView, Text, View, TouchableOpacity, FlatList, Animated } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { getTodayDate, getNextDays, formatDate } from "@/lib/storage";
import { useState, useEffect, useRef } from "react";
import { useSwipeNavigation, getNextScreen } from "@/hooks/use-swipe-navigation";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const colors = useColors();
  const { state } = useApp();
  const { state: authState } = useAuth();
  const router = useRouter();
  const [completedToday, setCompletedToday] = useState(0);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Staggered animation sequence
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(statsSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const today = getTodayDate();
  const todayTasks = state.tasks.filter((t) => t.dueDate === today && !t.completed);
  const nextDays = getNextDays(3).slice(1);
  const upcomingTasks = state.tasks.filter((t) => nextDays.includes(t.dueDate) && !t.completed);
  const activeGoals = state.goals.filter((g) => g.status === "active");

  const totalTasksToday = state.tasks.filter((t) => t.dueDate === today).length;
  const completionRate = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0;

  const StatCard = ({ icon, value, label, color }: any) => (
    <View
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: "center",
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: color,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
          shadowColor: color,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
          {icon}
        </Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "500" }}>
        {label}
      </Text>
    </View>
  );

  return (
    <ScreenContainer
      className="p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Animated Header */}
        <Animated.View
          style={{
            marginBottom: 24,
            opacity: headerOpacity,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: "800", color: colors.foreground }}>
            Welcome Back,{"\n"}{authState.user?.name?.split(" ")[0]}!
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, fontWeight: "500" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </Animated.View>

        {/* Animated Daily Stats */}
        <Animated.View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
            transform: [{ translateY: statsSlide }],
            opacity: statsOpacity,
          }}
        >
          <StatCard
            icon={completionRate > 0 ? "🎯" : "📋"}
            value={`${completionRate}%`}
            label="Today's Progress"
            color={colors.primary}
          />
          <StatCard
            icon="✅"
            value={completedToday}
            label="Tasks Done"
            color={colors.success}
          />
          <StatCard
            icon="🚀"
            value={activeGoals.length}
            label="Active Goals"
            color={colors.warning}
          />
        </Animated.View>

        {/* Animated Content */}
        <Animated.View
          style={{
            transform: [{ translateY: contentSlide }],
            opacity: contentOpacity,
          }}
        >
          {/* Today's Tasks */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                📝 Today's Tasks
              </Text>
              <View
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 12, color: "white", fontWeight: "600" }}>
                  {todayTasks.length}
                </Text>
              </View>
            </View>

            <FlatList
              data={todayTasks.slice(0, 3)}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 14,
                    marginBottom: 10,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      item.priority === "high"
                        ? "#EF4444"
                        : item.priority === "medium"
                          ? "#F59E0B"
                          : "#22C55E",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    {item.title}
                  </Text>
                  {item.dueTime && (
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 6, fontWeight: "500" }}>
                      🕐 {item.dueTime}
                    </Text>
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "500" }}>
                    ✨ No tasks for today. Great job!
                  </Text>
                </View>
              }
            />
          </View>

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                ⏰ Upcoming
              </Text>

              <FlatList
                data={upcomingTasks.slice(0, 3)}
                renderItem={({ item }) => (
                  <View
                    style={{
                      padding: 14,
                      marginBottom: 10,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      borderLeftWidth: 3,
                      borderLeftColor: colors.primary,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, flex: 1 }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "500" }}>
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
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                🎯 Active Goals
              </Text>

              <FlatList
                data={activeGoals.slice(0, 2)}
                renderItem={({ item }) => (
                  <View
                    style={{
                      padding: 14,
                      marginBottom: 10,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      borderTopWidth: 3,
                      borderTopColor: colors.primary,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 10 }}>
                      {item.title}
                    </Text>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.border,
                        overflow: "hidden",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${item.progress}%`,
                          backgroundColor: colors.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
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
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                All caught up!
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                Create a task or goal to get started
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
