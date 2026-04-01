import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  positive?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  positive = true,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={clsx('text-xs mt-1.5 font-medium', positive ? 'text-green-600' : 'text-red-500')}>
            {positive ? '▲' : '▼'} {change}
          </p>
        )}
      </div>
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
