import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock __DEV__ global
(global as any).__DEV__ = false;

// Mock dependencies before importing
vi.mock("expo-notifications", () => ({
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  setNotificationHandler: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  getNotificationChannelsAsync: vi.fn(),
  addNotificationReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  getLastNotificationResponse: vi.fn(),
  AndroidImportance: { MAX: 4, HIGH: 3, DEFAULT: 2, LOW: 1, MIN: 0 },
}));
vi.mock("@react-native-async-storage/async-storage", () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));
vi.mock("expo", () => ({
  isRunningInExpoGo: () => false,
}));

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  scheduleTaskReminder,
  scheduleGoalReminder,
  scheduleHabitReminder,
  cancelTaskNotifications,
  cancelGoalNotifications,
  cancelHabitNotifications,
} from "../lib/notification-service";
import { Task, Goal, Habit } from "../lib/storage";

// Suppress console errors during tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scheduleTaskReminder", () => {
    it("should schedule a task reminder 30 minutes before due time", async () => {
      const task: Task = {
        id: "task-1",
        title: "Test Task",
        priority: "high",
        dueDate: "2026-06-20",
        dueTime: "14:00",
        category: "work",
        completed: false,
        repeat: "none",
        createdAt: "2026-06-15T10:00:00Z",
        updatedAt: "2026-06-15T10:00:00Z",
      };

      vi.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue("notif-1");
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();

      await scheduleTaskReminder(task);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it("should not schedule reminder if due time is in the past", async () => {
      const task: Task = {
        id: "task-1",
        title: "Test Task",
        priority: "high",
        dueDate: "2026-06-10",
        dueTime: "09:00",
        category: "work",
        completed: false,
        repeat: "none",
        createdAt: "2026-06-15T10:00:00Z",
        updatedAt: "2026-06-15T10:00:00Z",
      };

      await scheduleTaskReminder(task);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe("scheduleGoalReminder", () => {
    it("should schedule a goal reminder 1 day before deadline", async () => {
      const goal: Goal = {
        id: "goal-1",
        title: "Test Goal",
        description: "Test description",
        category: "personal",
        deadline: "2026-07-20",
        status: "active",
        progress: 0,
        milestones: [],
        createdAt: "2026-06-15T10:00:00Z",
        updatedAt: "2026-06-15T10:00:00Z",
      };

      vi.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue("notif-1");
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();

      await scheduleGoalReminder(goal);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe("scheduleHabitReminder", () => {
    it("should schedule daily habit reminder at 8 AM", async () => {
      const habit: Habit = {
        id: "habit-1",
        title: "Morning Exercise",
        category: "health",
        frequency: "daily",
        color: "#FF6B6B",
        completedDates: [],
        createdAt: "2026-06-15T10:00:00Z",
        updatedAt: "2026-06-15T10:00:00Z",
      };

      vi.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue("notif-1");
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();

      await scheduleHabitReminder(habit);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it("should schedule weekly habit reminder for specific days", async () => {
      const habit: Habit = {
        id: "habit-1",
        title: "Yoga",
        category: "health",
        frequency: "weekly",
        daysOfWeek: [0, 3, 5], // Sunday, Wednesday, Friday
        color: "#4ECDC4",
        completedDates: [],
        createdAt: "2026-06-15T10:00:00Z",
        updatedAt: "2026-06-15T10:00:00Z",
      };

      vi.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue("notif-1");
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();

      await scheduleHabitReminder(habit);

      // Should schedule 3 times (one for each day)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe("cancelTaskNotifications", () => {
    it("should cancel all notifications for a task", async () => {
      const mockMap = {
        taskIds: { "task-1": ["notif-1", "notif-2"] },
        goalIds: {},
        habitIds: {},
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockMap));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();
      vi.mocked(Notifications.cancelScheduledNotificationAsync).mockResolvedValue();

      await cancelTaskNotifications("task-1");

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("notif-1");
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("notif-2");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("cancelGoalNotifications", () => {
    it("should cancel all notifications for a goal", async () => {
      const mockMap = {
        taskIds: {},
        goalIds: { "goal-1": ["notif-3"] },
        habitIds: {},
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockMap));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();
      vi.mocked(Notifications.cancelScheduledNotificationAsync).mockResolvedValue();

      await cancelGoalNotifications("goal-1");

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("notif-3");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("cancelHabitNotifications", () => {
    it("should cancel all notifications for a habit", async () => {
      const mockMap = {
        taskIds: {},
        goalIds: {},
        habitIds: { "habit-1": ["notif-4", "notif-5", "notif-6"] },
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockMap));
      vi.mocked(AsyncStorage.setItem).mockResolvedValue();
      vi.mocked(Notifications.cancelScheduledNotificationAsync).mockResolvedValue();

      await cancelHabitNotifications("habit-1");

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(3);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
