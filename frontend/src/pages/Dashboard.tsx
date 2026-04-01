import { useEffect, useState } from 'react'
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import StatCard from '../components/common/StatCard'
import api from '../api/axios'
import { DashboardStats } from '../types'

const areaData = [
  { month: '1월', 매출: 65000, 주문: 420 },
  { month: '2월', 매출: 72000, 주문: 480 },
  { month: '3월', 매출: 68000, 주문: 450 },
  { month: '4월', 매출: 91000, 주문: 610 },
  { month: '5월', 매출: 85000, 주문: 560 },
  { month: '6월', 매출: 110000, 주문: 730 },
  { month: '7월', 매출: 128400, 주문: 850 },
]

const recentUsers = [
  { id: 1, name: '김철수', email: 'kim@example.com', role: '관리자', status: '활성' },
  { id: 2, name: '이영희', email: 'lee@example.com', role: '매니저', status: '활성' },
  { id: 3, name: '박민준', email: 'park@example.com', role: '관리자', status: '비활성' },
  { id: 4, name: '최지우', email: 'choi@example.com', role: '매니저', status: '활성' },
  { id: 5, name: '정수연', email: 'jung@example.com', role: '관리자', status: '활성' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data))
  }, [])

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">전체 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="전체 사용자"
          value={stats?.totalUsers.toLocaleString() ?? '-'}
          icon={Users}
          change="12% 지난달 대비"
          color="blue"
        />
        <StatCard
          title="활성 사용자"
          value={stats?.activeUsers.toLocaleString() ?? '-'}
          icon={TrendingUp}
          change="8% 지난달 대비"
          color="green"
        />
        <StatCard
          title="전체 주문"
          value={stats?.totalOrders.toLocaleString() ?? '-'}
          icon={ShoppingCart}
          change="5% 지난달 대비"
          color="purple"
        />
        <StatCard
          title="총 매출"
          value={stats ? `₩${stats.revenue.toLocaleString()}` : '-'}
          icon={DollarSign}
          change="18% 지난달 대비"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 mb-4">매출 추이</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b84ff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1b84ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="매출"
                stroke="#1b84ff"
                strokeWidth={2}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">월별 주문</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="주문" fill="#1b84ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">최근 가입 사용자</h2>
          <button className="text-sm text-primary hover:underline">전체 보기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-3">이름</th>
                <th className="text-left text-gray-500 font-medium pb-3">이메일</th>
                <th className="text-left text-gray-500 font-medium pb-3">역할</th>
                <th className="text-left text-gray-500 font-medium pb-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="py-3 text-gray-500">{user.email}</td>
                  <td className="py-3 text-gray-600">{user.role}</td>
                  <td className="py-3">
                    <span
                      className={
                        user.status === '활성'
                          ? 'px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                          : 'px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
