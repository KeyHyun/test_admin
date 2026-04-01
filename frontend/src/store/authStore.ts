import { create } from 'zustand'
import { AuthUser } from '../types'
import api from '../api/axios'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  init: () => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('authUser')
    if (token && userStr) {
      set({ user: JSON.parse(userStr), isAuthenticated: true })
    }
  },

  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    localStorage.setItem('accessToken', data.accessToken)
    const user: AuthUser = { username: data.username, name: data.name, role: data.role }
    localStorage.setItem('authUser', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authUser')
    set({ user: null, isAuthenticated: false })
  },
}))
