import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "./storage";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatar?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "@focusflow_auth";
const USERS_KEY = "@focusflow_users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = React.useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const authData = await AsyncStorage.getItem(AUTH_KEY);
        if (authData) {
          const user = JSON.parse(authData);
          dispatch({ type: "SET_USER", payload: user });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Get all users
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user with matching email and password
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
      dispatch({ type: "SET_USER", payload: userWithoutPassword });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Get all users
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("Email already registered");
      }

      // Create new user
      const newUser = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
      dispatch({ type: "SET_USER", payload: userWithoutPassword });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateProfile = async (name: string, avatar?: string) => {
    try {
      if (!state.user) return;

      const updatedUser = {
        ...state.user,
        name: name.trim(),
        avatar,
      };

      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      dispatch({ type: "SET_USER", payload: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
