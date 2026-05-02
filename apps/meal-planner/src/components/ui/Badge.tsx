import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  color?: 'brand' | 'blue' | 'green' | 'purple' | 'gray'
  className?: string
}

const colors = {
  brand: 'bg-brand-100 text-brand-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-600',
}

export default function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  )
}
