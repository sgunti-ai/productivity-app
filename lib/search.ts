import { Task } from "./storage";

export interface SearchFilters {
  query: string;
  priorities: ("high" | "medium" | "low")[];
  categories: string[];
  status: ("completed" | "incomplete")[];
  dateRange: "today" | "week" | "month" | "custom" | "all";
  customStartDate?: string;
  customEndDate?: string;
}

export interface SearchResult {
  type: "task" | "goal" | "habit";
  id: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
}

export const defaultFilters: SearchFilters = {
  query: "",
  priorities: [],
  categories: [],
  status: [],
  dateRange: "all",
};

export function getDateRangeStart(range: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (range) {
    case "today":
      return today;
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return weekStart;
    case "month":
      return new Date(today.getFullYear(), today.getMonth(), 1);
    default:
      return new Date(0);
  }
}

export function getDateRangeEnd(range: string): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  switch (range) {
    case "today":
      return today;
    case "week":
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + (6 - today.getDay()));
      weekEnd.setHours(23, 59, 59, 999);
      return weekEnd;
    case "month":
      return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    default:
      return new Date(8640000000000000);
  }
}

export function matchesQuery(text: string, query: string): boolean {
  if (!query.trim()) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

export function matchesFilters(task: Task, filters: SearchFilters): boolean {
  // Query match
  if (!matchesQuery(task.title, filters.query) && !matchesQuery(task.description || "", filters.query)) {
    return false;
  }

  // Priority filter
  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false;
  }

  // Category filter
  if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
    return false;
  }

  // Status filter
  if (filters.status.length > 0) {
    const taskStatus = task.completed ? "completed" : "incomplete";
    if (!filters.status.includes(taskStatus as "completed" | "incomplete")) {
      return false;
    }
  }

  // Date range filter
  if (filters.dateRange !== "all") {
    const taskDate = new Date(task.dueDate);
    let startDate: Date;
    let endDate: Date;

    if (filters.dateRange === "custom" && filters.customStartDate && filters.customEndDate) {
      startDate = new Date(filters.customStartDate);
      endDate = new Date(filters.customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = getDateRangeStart(filters.dateRange);
      endDate = getDateRangeEnd(filters.dateRange);
    }

    if (taskDate < startDate || taskDate > endDate) {
      return false;
    }
  }

  return true;
}

export function filterTasks(tasks: Task[], filters: SearchFilters): Task[] {
  return tasks.filter((task) => matchesFilters(task, filters));
}
