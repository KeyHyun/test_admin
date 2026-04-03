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
        'fixed top-0 left-0 z-30 h-full bg-sidebar flex flex-col transition-all duration-300 shrink-0',
        'lg:relative',
        isOpen
          ? 'w-64 translate-x-0'
          : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
        isOpen ? 'justify-between' : 'lg:justify-center justify-between'
      )}>
        <div className={clsx('flex items-center', isOpen ? 'gap-3' : 'lg:gap-0 gap-3')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className={clsx('text-white font-bold text-lg tracking-tight', !isOpen && 'lg:hidden')}>
            AdminPanel
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            <p className={clsx(
              'text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2',
              !isOpen && 'lg:hidden'
            )}>
              {group.group}
            </p>
            {!isOpen && <div className="lg:block hidden border-t border-sidebar-border mb-2 mx-1" />}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors',
                    !isOpen && 'lg:justify-center lg:px-0',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={clsx(!isOpen && 'lg:hidden')}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border shrink-0">
        <div className={clsx('flex items-center gap-3', !isOpen && 'lg:justify-center')}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-bold">AD</span>
          </div>
          <div className={clsx('flex-1 min-w-0', !isOpen && 'lg:hidden')}>
            <p className="text-white text-sm font-medium truncate">v1.0.0</p>
            <p className="text-gray-500 text-xs">Spring Boot + React</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
