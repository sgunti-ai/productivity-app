import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Task, Goal, getTasks, getGoals, saveTask, deleteTask, saveGoal, deleteGoal, updateGoalProgress } from "./storage";

interface AppState {
  tasks: Task[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_GOALS"; payload: Goal[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AppState = {
  tasks: [],
  goals: [],
  loading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_GOALS":
      return { ...state, goals: action.payload };
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
        const [tasksData, goalsData] = await Promise.all([getTasks(), getGoals()]);
        dispatch({ type: "SET_TASKS", payload: tasksData });
        dispatch({ type: "SET_GOALS", payload: goalsData });
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

      // Update goal progress if task is linked to a goal
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

      // Update goal progress if task is linked to a goal
      if (task.goalId) {
        await updateGoalProgress(task.goalId);
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

      // Update goal progress if task was linked to a goal
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

  const refreshData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const [tasksData, goalsData] = await Promise.all([getTasks(), getGoals()]);
      dispatch({ type: "SET_TASKS", payload: tasksData });
      dispatch({ type: "SET_GOALS", payload: goalsData });
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
