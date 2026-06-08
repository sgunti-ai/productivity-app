import { ScrollView, View, Text, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import { getTodayDate } from "@/lib/storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function CalendarScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const formatDateString = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split("T")[0];
  };

  const getTasksForDate = (dateStr: string) => {
    return state.tasks.filter((task) => task.dueDate === dateStr);
  };

  const getGoalsForDate = (dateStr: string) => {
    return state.goals.filter((goal) => goal.deadline === dateStr);
  };

  const getHabitsForDate = (dateStr: string) => {
    return state.habits;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const goalsForSelectedDate = getGoalsForDate(selectedDate);
  const habitsForSelectedDate = getHabitsForDate(selectedDate);

  const allActivities = [
    ...tasksForSelectedDate.map((task) => ({ type: "task", data: task })),
    ...goalsForSelectedDate.map((goal) => ({ type: "goal", data: goal })),
    ...habitsForSelectedDate.map((habit) => ({ type: "habit", data: habit })),
  ];

  const handleActivityPress = (type: string, id: string) => {
    if (type === "task") {
      router.push({ pathname: "/drawer-layout/task-modal", params: { taskId: id } });
    } else if (type === "goal") {
      router.push({ pathname: "/drawer-layout/goal-modal", params: { goalId: id } });
    } else if (type === "habit") {
      router.push({ pathname: "/drawer-layout/habit-modal", params: { habitId: id } });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return "check-circle";
      case "goal":
        return "flag";
      case "habit":
        return "repeat";
      default:
        return "circle";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task":
        return colors.primary;
      case "goal":
        return "#8B5CF6";
      case "habit":
        return "#06B6D4";
      default:
        return colors.muted;
    }
  };

  const countActivitiesForDate = (dateStr: string) => {
    return (
      getTasksForDate(dateStr).length +
      getGoalsForDate(dateStr).length +
      getHabitsForDate(dateStr).length
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
          Calendar
        </Text>

        {/* Month Navigation */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={handlePrevMonth}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
            {monthName}
          </Text>
          <Pressable
            onPress={handleNextMonth}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>→</Text>
          </Pressable>
        </View>

        {/* Day Headers */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 8,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text
              key={day}
              style={{
                width: "14.28%",
                textAlign: "center",
                fontWeight: "600",
                color: colors.muted,
                fontSize: 12,
              }}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={{ marginBottom: 24 }}>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
            <View
              key={weekIndex}
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 8,
              }}
            >
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const dateStr = day ? formatDateString(day) : null;
                const activitiesCount = dateStr ? countActivitiesForDate(dateStr) : 0;
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === getTodayDate();

                return (
                  <Pressable
                    key={dayIndex}
                    onPress={() => dateStr && setSelectedDate(dateStr)}
                    style={({ pressed }) => ({
                      width: "14.28%",
                      aspectRatio: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      backgroundColor:
                        isSelected
                          ? colors.primary
                          : isToday
                            ? colors.surface
                            : "transparent",
                      opacity: pressed ? 0.8 : 1,
                      borderWidth: isToday && !isSelected ? 2 : 0,
                      borderColor: colors.primary,
                    })}
                  >
                    {day ? (
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: isSelected ? "white" : colors.foreground,
                          }}
                        >
                          {day}
                        </Text>
                        {activitiesCount > 0 && (
                          <View
                            style={{
                              marginTop: 2,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: isSelected ? "white" : colors.primary,
                            }}
                          />
                        )}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected Date Activities */}
        <View
          style={{
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Activities for {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Text>

          {allActivities.length > 0 ? (
            allActivities.map((item, index) => (
              <Pressable
                key={`${item.type}-${item.data.id}-${index}`}
                onPress={() => handleActivityPress(item.type, item.data.id)}
                style={({ pressed }) => ({
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: getActivityColor(item.type),
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                })}
              >
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialIcons name={getActivityIcon(item.type)} size={20} color={getActivityColor(item.type)} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {item.data.title}
                    </Text>
                    {item.type === "task" && (item.data as any).dueTime && (
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        {(item.data as any).dueTime}
                      </Text>
                    )}
                    {item.type === "goal" && (
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        Goal • {(item.data as any).category}
                      </Text>
                    )}
                    {item.type === "habit" && (
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        Habit • {(item.data as any).frequency}
                      </Text>
                    )}
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </Pressable>
            ))
          ) : (
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 20 }}>
              No activities scheduled for this date
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
