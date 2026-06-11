import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate: string; // ISO date string
  dueTime?: string; // HH:mm format
  category: string;
  completed: boolean;
  completedAt?: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string; // ISO date string
  status: "active" | "completed" | "on_hold";
  progress: number; // 0-100
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: "daily" | "weekly" | "custom";
  daysOfWeek?: number[]; // 0-6 for weekly habits
  color: string;
  goalId?: string;
  completedDates: string[]; // ISO date strings
  createdAt: string;
  updatedAt: string;
}

export interface StreakData {
  taskId?: string;
  habitId?: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  updatedAt: string;
}

const TASKS_KEY = "@focusflow_tasks";
const GOALS_KEY = "@focusflow_goals";
const SETTINGS_KEY = "@focusflow_settings";
const HABITS_KEY = "@focusflow_habits";
const STREAKS_KEY = "@focusflow_streaks";

// Clear all data from AsyncStorage (for debugging/reset)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TASKS_KEY, GOALS_KEY, HABITS_KEY, STREAKS_KEY, SETTINGS_KEY]);
    console.log("All data cleared from AsyncStorage");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

// Task Storage Functions
export async function getTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
}

export async function saveTask(task: Task): Promise<void> {
  try {
    const tasks = await getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
    } else {
      tasks.push({ ...task, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const tasks = await getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  try {
    const tasks = await getTasks();
    return tasks.filter((t) => t.dueDate === date);
  } catch (error) {
    console.error("Error getting tasks by date:", error);
    return [];
  }
}

export async function getTasksByGoal(goalId: string): Promise<Task[]> {
  try {
    const tasks = await getTasks();
    return tasks.filter((t) => t.goalId === goalId);
  } catch (error) {
    console.error("Error getting tasks by goal:", error);
    return [];
  }
}

export async function getCompletedTasksToday(): Promise<number> {
  try {
    const tasks = await getTasks();
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter((t) => t.dueDate === today && t.completed).length;
  } catch (error) {
    console.error("Error getting completed tasks:", error);
    return 0;
  }
}

// Goal Storage Functions
export async function getGoals(): Promise<Goal[]> {
  try {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading goals:", error);
    return [];
  }
}

export async function saveGoal(goal: Goal): Promise<void> {
  try {
    const goals = await getGoals();
    const existingIndex = goals.findIndex((g) => g.id === goal.id);

    if (existingIndex >= 0) {
      goals[existingIndex] = { ...goal, updatedAt: new Date().toISOString() };
    } else {
      goals.push({ ...goal, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error("Error saving goal:", error);
  }
}

export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goals = await getGoals();
    const filtered = goals.filter((g) => g.id !== goalId);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting goal:", error);
  }
}

export async function updateGoalProgress(goalId: string): Promise<void> {
  try {
    const goals = await getGoals();
    const goal = goals.find((g) => g.id === goalId);

    if (goal) {
      const tasks = await getTasksByGoal(goalId);
      const completedCount = tasks.filter((t) => t.completed).length;
      goal.progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
      goal.updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
  } catch (error) {
    console.error("Error updating goal progress:", error);
  }
}

// Settings Storage
export async function getSettings(): Promise<Record<string, any>> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { theme: "light", notifications: true };
  } catch (error) {
    console.error("Error reading settings:", error);
    return { theme: "light", notifications: true };
  }
}

export async function saveSetting(key: string, value: any): Promise<void> {
  try {
    const settings = await getSettings();
    settings[key] = value;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving setting:", error);
  }
}

// Utility Functions
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getNextDays(count: number): string[] {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(dateString: string, timeString?: string): string {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (timeString) {
    return `${formatted} at ${timeString}`;
  }
  return formatted;
}

// Habit Storage Functions
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading habits:", error);
    return [];
  }
}

export async function saveHabit(habit: Habit): Promise<void> {
  try {
    const habits = await getHabits();
    const existingIndex = habits.findIndex((h) => h.id === habit.id);

    if (existingIndex >= 0) {
      habits[existingIndex] = { ...habit, updatedAt: new Date().toISOString() };
    } else {
      habits.push({ ...habit, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Error saving habit:", error);
  }
}

export async function deleteHabit(habitId: string): Promise<void> {
  try {
    const habits = await getHabits();
    const filtered = habits.filter((h) => h.id !== habitId);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting habit:", error);
  }
}

export async function completeHabitToday(habitId: string): Promise<void> {
  try {
    const habits = await getHabits();
    const habit = habits.find((h) => h.id === habitId);
    const today = getTodayDate();

    if (habit && !habit.completedDates.includes(today)) {
      habit.completedDates.push(today);
      habit.updatedAt = new Date().toISOString();
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      await updateStreakData(habitId, true);
    }
  } catch (error) {
    console.error("Error completing habit:", error);
  }
}

// Streak Storage Functions
export async function getStreaks(): Promise<StreakData[]> {
  try {
    const data = await AsyncStorage.getItem(STREAKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading streaks:", error);
    return [];
  }
}

export async function updateStreakData(id: string, isHabit: boolean = false): Promise<StreakData | null> {
  try {
    const streaks = await getStreaks();
    const key = isHabit ? "habitId" : "taskId";
    let streak = streaks.find((s) => (isHabit ? s.habitId === id : s.taskId === id));

    if (!streak) {
      streak = {
        [key]: id,
        currentStreak: 0,
        longestStreak: 0,
        updatedAt: new Date().toISOString(),
      } as StreakData;
      streaks.push(streak);
    }

    const today = getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (streak.lastCompletedDate === today) {
      return streak;
    } else if (streak.lastCompletedDate === yesterdayStr) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastCompletedDate = today;
    streak.updatedAt = new Date().toISOString();

    await AsyncStorage.setItem(STREAKS_KEY, JSON.stringify(streaks));
    return streak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return null;
  }
}

export async function getStreakData(id: string, isHabit: boolean = false): Promise<StreakData | null> {
  try {
    const streaks = await getStreaks();
    return streaks.find((s) => (isHabit ? s.habitId === id : s.taskId === id)) || null;
  } catch (error) {
    console.error("Error getting streak data:", error);
    return null;
  }
}
