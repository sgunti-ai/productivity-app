import { Task, generateId } from "./storage";

export function getNextRecurringDate(currentDate: string, repeatType: "daily" | "weekly" | "monthly"): string {
  const date = new Date(currentDate);

  switch (repeatType) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.toISOString().split("T")[0];
}

export function createNextRecurringTask(task: Task): Task | null {
  if (task.repeat === "none") {
    return null;
  }

  const nextDate = getNextRecurringDate(task.dueDate, task.repeat);

  return {
    id: generateId(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: nextDate,
    dueTime: task.dueTime,
    category: task.category,
    completed: false,
    repeat: task.repeat,
    goalId: task.goalId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function shouldCreateNextRecurringTask(task: Task): boolean {
  return task.repeat !== "none" && task.completed;
}

export function processRecurringTasks(tasks: Task[]): Task[] {
  const newTasks: Task[] = [];

  for (const task of tasks) {
    if (shouldCreateNextRecurringTask(task)) {
      const nextTask = createNextRecurringTask(task);
      if (nextTask) {
        newTasks.push(nextTask);
      }
    }
  }

  return newTasks;
}

export function getRecurringTaskInfo(task: Task): {
  isRecurring: boolean;
  frequency: string;
  nextOccurrence?: string;
} {
  if (task.repeat === "none") {
    return { isRecurring: false, frequency: "None" };
  }

  const nextOccurrence = getNextRecurringDate(task.dueDate, task.repeat);
  const frequencyMap = {
    daily: "Every day",
    weekly: "Every week",
    monthly: "Every month",
  };

  return {
    isRecurring: true,
    frequency: frequencyMap[task.repeat],
    nextOccurrence,
  };
}
