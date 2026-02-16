import { create } from 'zustand'
import { authAPI, userAPI } from '../services/api'

interface User {
  id: number
  email: string
  username: string
  role: 'guest' | 'user' | 'admin'
  is_active: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(email, password)
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      set({ token: access_token, isAuthenticated: true })
      
      // Fetch user profile
      const userResponse = await userAPI.getProfile()
      set({ user: userResponse.data, isLoading: false })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
  
  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      await authAPI.register({ email, username, password })
      
      // Auto-login after registration
      await useAuthStore.getState().login(email, password)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  fetchUser: async () => {
    if (!localStorage.getItem('token')) return
    
    set({ isLoading: true })
    try {
      const response = await userAPI.getProfile()
      set({ user: response.data, isLoading: false })
    } catch (error) {
      // Token invalid, logout
      useAuthStore.getState().logout()
      set({ isLoading: false })
    }
  },
  
  clearError: () => set({ error: null }),
}))

// Initialize user on app load
if (localStorage.getItem('token')) {
  useAuthStore.getState().fetchUser()
}
