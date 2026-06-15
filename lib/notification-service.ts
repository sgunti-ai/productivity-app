import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Task, Goal, Habit, getTodayDate } from "./storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Notification IDs storage key
const NOTIFICATION_IDS_KEY = "@focusflow_notification_ids";

// Notification ID mapping to track scheduled notifications
interface NotificationIdMap {
  taskIds: Record<string, string[]>; // taskId -> [notificationIds]
  goalIds: Record<string, string[]>; // goalId -> [notificationIds]
  habitIds: Record<string, string[]>; // habitId -> [notificationIds]
}

// Initialize notification handler
export async function initializeNotifications() {
  // Set notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });

  // Setup Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#007AFF",
    });

    // Create channels for different notification types
    await Notifications.setNotificationChannelAsync("tasks", {
      name: "Task Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#007AFF",
    });

    await Notifications.setNotificationChannelAsync("goals", {
      name: "Goal Milestones",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#34C759",
    });

    await Notifications.setNotificationChannelAsync("habits", {
      name: "Habit Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF9500",
    });
  }
}

// Get stored notification IDs
async function getNotificationIds(): Promise<NotificationIdMap> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    return data
      ? JSON.parse(data)
      : { taskIds: {}, goalIds: {}, habitIds: {} };
  } catch (error) {
    console.error("Error reading notification IDs:", error);
    return { taskIds: {}, goalIds: {}, habitIds: {} };
  }
}

// Save notification IDs
async function saveNotificationIds(map: NotificationIdMap): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Error saving notification IDs:", error);
  }
}

// Schedule task reminder (30 minutes before due time, or at due date if no time)
export async function scheduleTaskReminder(task: Task): Promise<void> {
  try {
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || "09:00"}`);
    const reminderTime = new Date(dueDateTime.getTime() - 30 * 60 * 1000); // 30 minutes before

    // Only schedule if reminder is in the future
    if (reminderTime <= new Date()) {
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Task Reminder",
        body: task.title,
        data: {
          taskId: task.id,
          type: "task",
          url: `/drawer-layout/(drawer-tabs)/tasks?taskId=${task.id}`,
        },
        sound: true,
      },
      trigger: {
        date: reminderTime,
      } as any,
    });

    // Store notification ID
    const map = await getNotificationIds();
    if (!map.taskIds[task.id]) {
      map.taskIds[task.id] = [];
    }
    map.taskIds[task.id].push(notificationId);
    await saveNotificationIds(map);
  } catch (error) {
    console.error("Error scheduling task reminder:", error);
  }
}

// Schedule goal deadline reminder (1 day before deadline)
export async function scheduleGoalReminder(goal: Goal): Promise<void> {
  try {
    const deadlineDate = new Date(goal.deadline);
    const reminderTime = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    // Only schedule if reminder is in the future
    if (reminderTime <= new Date()) {
      return;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎯 Goal Deadline Approaching",
        body: goal.title,
        data: {
          goalId: goal.id,
          type: "goal",
          url: `/drawer-layout/(drawer-tabs)/goals?goalId=${goal.id}`,
        },
        sound: true,
      },
      trigger: {
        date: reminderTime,
      } as any,
    });

    // Store notification ID
    const map = await getNotificationIds();
    if (!map.goalIds[goal.id]) {
      map.goalIds[goal.id] = [];
    }
    map.goalIds[goal.id].push(notificationId);
    await saveNotificationIds(map);
  } catch (error) {
    console.error("Error scheduling goal reminder:", error);
  }
}

// Schedule daily habit reminder (at 8 AM)
export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  try {
    // For daily habits, schedule at 8 AM every day
    if (habit.frequency === "daily") {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔄 Daily Habit Check-in",
          body: habit.title,
          data: {
            habitId: habit.id,
            type: "habit",
            url: `/drawer-layout/(drawer-tabs)/habits?habitId=${habit.id}`,
          },
          sound: true,
        },
      trigger: {
        type: "calendar" as any,
        hour: 8,
        minute: 0,
        repeats: true,
      } as any,
      });

      // Store notification ID
      const map = await getNotificationIds();
      if (!map.habitIds[habit.id]) {
        map.habitIds[habit.id] = [];
      }
      map.habitIds[habit.id].push(notificationId);
      await saveNotificationIds(map);
    }

    // For weekly habits, schedule on specific days at 8 AM
    if (habit.frequency === "weekly" && habit.daysOfWeek) {
      for (const dayOfWeek of habit.daysOfWeek) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🔄 Weekly Habit Check-in",
            body: habit.title,
            data: {
              habitId: habit.id,
              type: "habit",
              url: `/drawer-layout/(drawer-tabs)/habits?habitId=${habit.id}`,
            },
            sound: true,
          },
      trigger: {
        type: "calendar" as any,
        weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday-Saturday)
        hour: 8,
        minute: 0,
        repeats: true,
      } as any,
        });

        // Store notification ID
        const map = await getNotificationIds();
        if (!map.habitIds[habit.id]) {
          map.habitIds[habit.id] = [];
        }
        map.habitIds[habit.id].push(notificationId);
        await saveNotificationIds(map);
      }
    }
  } catch (error) {
    console.error("Error scheduling habit reminder:", error);
  }
}

// Cancel all notifications for a task
export async function cancelTaskNotifications(taskId: string): Promise<void> {
  try {
    const map = await getNotificationIds();
    const notificationIds = map.taskIds[taskId] || [];

    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    delete map.taskIds[taskId];
    await saveNotificationIds(map);
  } catch (error) {
    console.error("Error canceling task notifications:", error);
  }
}

// Cancel all notifications for a goal
export async function cancelGoalNotifications(goalId: string): Promise<void> {
  try {
    const map = await getNotificationIds();
    const notificationIds = map.goalIds[goalId] || [];

    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    delete map.goalIds[goalId];
    await saveNotificationIds(map);
  } catch (error) {
    console.error("Error canceling goal notifications:", error);
  }
}

// Cancel all notifications for a habit
export async function cancelHabitNotifications(habitId: string): Promise<void> {
  try {
    const map = await getNotificationIds();
    const notificationIds = map.habitIds[habitId] || [];

    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    delete map.habitIds[habitId];
    await saveNotificationIds(map);
  } catch (error) {
    console.error("Error canceling habit notifications:", error);
  }
}

// Snooze a notification (reschedule for 10 minutes later)
export async function snoozeNotification(
  notificationId: string,
  title: string,
  body: string,
  data: any
): Promise<void> {
  try {
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⛰ " + title,
        body: body,
        data: data,
        sound: true,
      },
      trigger: {
        date: snoozeTime,
      } as any,
    });
  } catch (error) {
    console.error("Error snoozing notification:", error);
  }
}

// Handle notification response (tap action)
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  onTaskTap?: (taskId: string) => void,
  onGoalTap?: (goalId: string) => void,
  onHabitTap?: (habitId: string) => void
): void {
  const data = response.notification.request.content.data as any;

  if (data?.type === "task" && data?.taskId && onTaskTap) {
    onTaskTap(data.taskId as string);
  } else if (data?.type === "goal" && data?.goalId && onGoalTap) {
    onGoalTap(data.goalId as string);
  } else if (data?.type === "habit" && data?.habitId && onHabitTap) {
    onHabitTap(data.habitId as string);
  }
}
