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

const TASKS_KEY = "@focusflow_tasks";
const GOALS_KEY = "@focusflow_goals";
const SETTINGS_KEY = "@focusflow_settings";

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
