import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Institutions from './pages/Institutions'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { init } = useAuthStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
        </Route>

        {/* Private */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/orders" element={<div className="card"><h1 className="text-xl font-bold">주문 관리</h1><p className="text-gray-500 mt-2">준비 중입니다.</p></div>} />
          <Route path="/reports" element={<div className="card"><h1 className="text-xl font-bold">리포트</h1><p className="text-gray-500 mt-2">준비 중입니다.</p></div>} />
          <Route path="/roles" element={<div className="card"><h1 className="text-xl font-bold">권한 관리</h1><p className="text-gray-500 mt-2">준비 중입니다.</p></div>} />
          <Route path="/settings" element={<div className="card"><h1 className="text-xl font-bold">설정</h1><p className="text-gray-500 mt-2">준비 중입니다.</p></div>} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
