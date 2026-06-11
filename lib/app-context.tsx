import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Task, Goal, Habit, StreakData, getTasks, getGoals, getHabits, getStreaks, saveTask, deleteTask, saveGoal, deleteGoal, updateGoalProgress, saveHabit, deleteHabit, updateStreakData, getStreakData, clearAllData } from "./storage";
import { SAMPLE_TASKS, SAMPLE_GOALS, SAMPLE_HABITS } from "./sample-data";
import { createNextRecurringTask } from "./recurring-tasks";

interface AppState {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  streaks: StreakData[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_GOALS"; payload: Goal[] }
  | { type: "SET_HABITS"; payload: Habit[] }
  | { type: "SET_STREAKS"; payload: StreakData[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "UPDATE_HABIT"; payload: Habit }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "UPDATE_STREAK"; payload: StreakData }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AppState = {
  tasks: [],
  goals: [],
  habits: [],
  streaks: [],
  loading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_GOALS":
      return { ...state, goals: action.payload };
    case "SET_HABITS":
      return { ...state, habits: action.payload };
    case "SET_STREAKS":
      return { ...state, streaks: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)),
      };
    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };
    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };
    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case "UPDATE_STREAK":
      return {
        ...state,
        streaks: state.streaks.some((s) => s.taskId === action.payload.taskId || s.habitId === action.payload.habitId)
          ? state.streaks.map((s) => {
              if (s.taskId === action.payload.taskId || s.habitId === action.payload.habitId) {
                return action.payload;
              }
              return s;
            })
          : [...state.streaks, action.payload],
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabitToday: (habitId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        
        // Force clear old data and reload sample data
        await clearAllData();
        
        let [tasksData, goalsData, habitsData, streaksData] = await Promise.all([
          getTasks(),
          getGoals(),
          getHabits(),
          getStreaks(),
        ]);

        // Load sample data if no data exists
        if (tasksData.length === 0 && goalsData.length === 0 && habitsData.length === 0) {
          for (const task of SAMPLE_TASKS) {
            await saveTask(task);
          }
          for (const goal of SAMPLE_GOALS) {
            await saveGoal(goal);
          }
          for (const habit of SAMPLE_HABITS) {
            await saveHabit(habit);
          }
          [tasksData, goalsData, habitsData, streaksData] = await Promise.all([
            getTasks(),
            getGoals(),
            getHabits(),
            getStreaks(),
          ]);
        }

        dispatch({ type: "SET_TASKS", payload: tasksData });
        dispatch({ type: "SET_GOALS", payload: goalsData });
        dispatch({ type: "SET_HABITS", payload: habitsData });
        dispatch({ type: "SET_STREAKS", payload: streaksData });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load data" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  const addTask = async (task: Task) => {
    try {
      await saveTask(task);
      dispatch({ type: "ADD_TASK", payload: task });

      if (task.goalId) {
        await updateGoalProgress(task.goalId);
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add task" });
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await saveTask(task);
      dispatch({ type: "UPDATE_TASK", payload: task });

      if (task.goalId) {
        await updateGoalProgress(task.goalId);
      }

      // Update streak if task is completed
      if (task.completed) {
        const streak = await updateStreakData(task.id, false);
        if (streak) {
          dispatch({ type: "UPDATE_STREAK", payload: streak });
        }

        // Create next recurring task if applicable
        if (task.repeat !== "none") {
          const nextTask = createNextRecurringTask(task);
          if (nextTask) {
            await saveTask(nextTask);
            dispatch({ type: "ADD_TASK", payload: nextTask });
          }
        }
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update task" });
    }
  };

  const deleteTaskHandler = async (taskId: string) => {
    try {
      const task = state.tasks.find((t) => t.id === taskId);
      await deleteTask(taskId);
      dispatch({ type: "DELETE_TASK", payload: taskId });

      if (task?.goalId) {
        await updateGoalProgress(task.goalId);
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete task" });
    }
  };

  const addGoal = async (goal: Goal) => {
    try {
      await saveGoal(goal);
      dispatch({ type: "ADD_GOAL", payload: goal });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add goal" });
    }
  };

  const updateGoal = async (goal: Goal) => {
    try {
      await saveGoal(goal);
      dispatch({ type: "UPDATE_GOAL", payload: goal });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update goal" });
    }
  };

  const deleteGoalHandler = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      dispatch({ type: "DELETE_GOAL", payload: goalId });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete goal" });
    }
  };

  const addHabit = async (habit: Habit) => {
    try {
      await saveHabit(habit);
      dispatch({ type: "ADD_HABIT", payload: habit });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add habit" });
    }
  };

  const updateHabit = async (habit: Habit) => {
    try {
      await saveHabit(habit);
      dispatch({ type: "UPDATE_HABIT", payload: habit });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update habit" });
    }
  };

  const deleteHabitHandler = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      dispatch({ type: "DELETE_HABIT", payload: habitId });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete habit" });
    }
  };

  const completeHabitToday = async (habitId: string) => {
    try {
      const habit = state.habits.find((h) => h.id === habitId);
      if (habit) {
        const today = new Date().toISOString().split("T")[0];
        if (!habit.completedDates.includes(today)) {
          const updated = { ...habit, completedDates: [...habit.completedDates, today] };
          await updateHabit(updated);
          const streak = await updateStreakData(habitId, true);
          if (streak) {
            dispatch({ type: "UPDATE_STREAK", payload: streak });
          }
        }
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to complete habit" });
    }
  };

  const refreshData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const [tasksData, goalsData, habitsData, streaksData] = await Promise.all([
        getTasks(),
        getGoals(),
        getHabits(),
        getStreaks(),
      ]);
      dispatch({ type: "SET_TASKS", payload: tasksData });
      dispatch({ type: "SET_GOALS", payload: goalsData });
      dispatch({ type: "SET_HABITS", payload: habitsData });
      dispatch({ type: "SET_STREAKS", payload: streaksData });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to refresh data" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const value: AppContextType = {
    state,
    addTask,
    updateTask,
    deleteTask: deleteTaskHandler,
    addGoal,
    updateGoal,
    deleteGoal: deleteGoalHandler,
    addHabit,
    updateHabit,
    deleteHabit: deleteHabitHandler,
    completeHabitToday,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
