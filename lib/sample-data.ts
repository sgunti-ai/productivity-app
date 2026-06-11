import { Task, Goal, Habit } from "./storage";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date(today);
nextMonth.setDate(nextMonth.getDate() + 30);

// Helper to convert date to YYYY-MM-DD format (matching getTodayDate() format)
const toDateString = (d: Date) => d.toISOString().split("T")[0];
const todayStr = toDateString(today);
const tomorrowStr = toDateString(tomorrow);
const nextWeekStr = toDateString(nextWeek);
const nextMonthStr = toDateString(nextMonth);

export const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Complete project proposal",
    description: "Finish the Q2 project proposal and submit to manager",
    dueDate: todayStr,
    dueTime: "14:00",
    priority: "high",
    category: "Work",
    completed: false,
    goalId: "goal-1",
    repeat: "none",
    createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Review team feedback",
    description: "Review and respond to team feedback from last meeting",
    dueDate: todayStr,
    dueTime: "10:00",
    priority: "medium",
    category: "Work",
    completed: true,
    goalId: undefined,
    repeat: "none",
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Gym session",
    description: "1 hour workout - cardio and strength training",
    dueDate: todayStr,
    dueTime: "17:00",
    priority: "high",
    category: "Health",
    completed: false,
    goalId: "goal-2",
    repeat: "daily",
    createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Buy groceries",
    description: "Milk, eggs, vegetables, chicken, rice",
    dueDate: tomorrowStr,
    dueTime: "18:00",
    priority: "medium",
    category: "Personal",
    completed: false,
    goalId: undefined,
    repeat: "none",
    createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Call dentist",
    description: "Schedule appointment for dental checkup",
    dueDate: tomorrowStr,
    dueTime: "09:00",
    priority: "low",
    category: "Health",
    completed: false,
    goalId: undefined,
    repeat: "none",
    createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-6",
    title: "Read research paper",
    description: "Read and summarize the AI paper for team discussion",
    dueDate: nextWeekStr,
    dueTime: "16:00",
    priority: "medium",
    category: "Learning",
    completed: false,
    goalId: "goal-3",
    repeat: "none",
    createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-7",
    title: "Team standup",
    description: "Daily team sync meeting",
    dueDate: todayStr,
    dueTime: "09:30",
    priority: "high",
    category: "Work",
    completed: false,
    goalId: undefined,
    repeat: "daily",
    createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-8",
    title: "Update portfolio",
    description: "Add latest projects and update resume",
    dueDate: nextWeekStr,
    dueTime: "14:00",
    priority: "low",
    category: "Learning",
    completed: false,
    goalId: "goal-3",
    repeat: "none",
    createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SAMPLE_GOALS: Goal[] = [
  {
    id: "goal-1",
    title: "Complete Q2 project",
    description: "Deliver the Q2 project on time with high quality",
    deadline: nextMonthStr,
    progress: 60,
    status: "active",
    category: "Work",
    milestones: [],
    createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-2",
    title: "Get fit",
    description: "Exercise 4 times a week and reach target weight",
    deadline: nextMonthStr,
    progress: 40,
    status: "active",
    category: "Health",
    milestones: [],
    createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-3",
    title: "Learn React Native",
    description: "Complete React Native course and build 2 apps",
    deadline: nextMonthStr,
    progress: 75,
    status: "active",
    category: "Learning",
    milestones: [],
    createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-4",
    title: "Save for vacation",
    description: "Save $3000 for summer vacation",
    deadline: nextMonthStr,
    progress: 50,
    status: "active",
    category: "Finance",
    milestones: [],
    createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const SAMPLE_HABITS: Habit[] = [
  {
    id: "habit-1",
    title: "Morning meditation",
    description: "10 minutes of meditation every morning",
    frequency: "daily",
    category: "Health",
    color: "#3B82F6",
    completedDates: generateCompletedDates(12),
    createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "habit-2",
    title: "Read before bed",
    description: "Read for 30 minutes before sleep",
    frequency: "daily",
    category: "Learning",
    color: "#8B5CF6",
    completedDates: generateCompletedDates(8),
    createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "habit-3",
    title: "Drink water",
    description: "Drink 8 glasses of water daily",
    frequency: "daily",
    category: "Health",
    color: "#06B6D4",
    completedDates: generateCompletedDates(25),
    createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "habit-4",
    title: "Weekly review",
    description: "Review the week and plan for next week",
    frequency: "weekly",
    category: "Learning",
    color: "#F59E0B",
    completedDates: generateCompletedDates(4, 7),
    createdAt: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateCompletedDates(count: number, interval: number = 1): string[] {
  const dates: string[] = [];
  const currentDate = new Date(today);

  for (let i = 0; i < count; i++) {
    currentDate.setDate(currentDate.getDate() - interval);
    dates.push(toDateString(currentDate));
  }

  return dates;
}
