import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  BarChart3,
  Settings,
  Shield,
  X,
} from 'lucide-react'
import clsx from 'clsx'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  {
    group: '메인',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
    ],
  },
  {
    group: '관리',
    items: [
      { to: '/institutions', icon: Building2, label: '기관 관리' },
      { to: '/orders', icon: ShoppingCart, label: '주문 관리' },
    ],
  },
  {
    group: '분석',
    items: [
      { to: '/reports', icon: BarChart3, label: '리포트' },
    ],
  },
  {
    group: '시스템',
    items: [
      { to: '/roles', icon: Shield, label: '권한 관리' },
      { to: '/settings', icon: Settings, label: '설정' },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 z-30 h-full w-64 bg-sidebar flex flex-col transition-transform duration-300',
        'lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AdminPanel</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">v1.0.0</p>
            <p className="text-gray-500 text-xs">Spring Boot + React</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
