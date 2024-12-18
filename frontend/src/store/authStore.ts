import { create } from "zustand";

// Define types for the user and the state
interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  message: string | null;

  signup: (email: string, password: string, username: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

//  API URL
const API_URL = "http://localhost:8000/api/auth";


const fetchWithCredentials = async (
  endpoint: string,
  options: RequestInit
): Promise<Response> => {
  return await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });
};

// Create the store with strict types
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchWithCredentials("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();
      if (response.ok) {
        set({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          message: data.message || null,
        });
      } else {
        set({
          isLoading: false,
          error: data.message || "Signup failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchWithCredentials("/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (response.ok) {
        set({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
        });
      } else {
        set({
          isLoading: false,
          error: data.message || "Email verification failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await fetchWithCredentials("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        set({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          message: data.message || null,
        });
      } else {
        set({
          isLoading: false,
          error: data.message || "Login failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isCheckingAuth: true, error: null });
  
    try {
      const response = await fetch(`${API_URL}/check-auth`, {
        method: "GET",
        credentials: "include",
      });
  
      if (response.status === 401) {
        // Refresh token logic
        const refreshResponse = await fetch(`${API_URL}/refresh-token`, {
          method: "GET",
          credentials: "include",
        });
  
        if (refreshResponse.ok) {
          // Retry auth check after token refresh
          return await useAuthStore.getState().checkAuth();
        }
      }
  
      const data: { user?: User } = await response.json();
      if (response.ok && data.user) {
        set({ isAuthenticated: true, user: data.user, isCheckingAuth: false });
      } else {
        set({ isAuthenticated: false, user: null, isCheckingAuth: false });
      }
    } catch (error) {
      set({
        isCheckingAuth: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(error);
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchWithCredentials("/logout", {
        method: "POST",
      });

      if (response.ok) {
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
        });
      } else {
        const data = await response.json();
        set({
          isLoading: false,
          error: data.message || "Logout failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await fetchWithCredentials("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        set({
          isLoading: false,
          message: data.message || null,
        });
      } else {
        set({
          isLoading: false,
          error: data.message || "Forgot password failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await fetchWithCredentials(`/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok) {
        set({
          isLoading: false,
          message: data.message || null,
        });
      } else {
        set({
          isLoading: false,
          error: data.message || "Reset password failed",
        });
      }
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}));
