import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
  className?: string
}

export function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  count = 1,
  className = '',
  ...props 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  }
  
  const getSize = () => {
    switch (variant) {
      case 'circular':
        return { width: width || 40, height: height || 40 }
      case 'rectangular':
        return { width: width || '100%', height: height || 120 }
      case 'card':
        return { width: width || '100%', height: height || 200 }
      default:
        return { width: width || '100%', height: height || 16 }
    }
  }
  
  const size = getSize()
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={{
            width: typeof size.width === 'number' ? `${size.width}px` : size.width,
            height: typeof size.height === 'number' ? `${size.height}px` : size.height,
            marginBottom: count > 1 && index < count - 1 ? '8px' : undefined
          }}
          {...props}
        />
      ))}
    </>
  )
}

// Skeleton components for specific use cases
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton variant="rectangular" height={80} />
      <div className="flex gap-2">
        <Skeleton width="30%" height={24} />
        <Skeleton width="30%" height={24} />
      </div>
    </div>
  )
}

export function SkeletonFoodEntry() {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-start gap-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={14} />
        <Skeleton width="90%" height={14} />
      </div>
      <Skeleton width={60} height={24} className="rounded-full" />
    </div>
  )
}

export function SkeletonDashboardCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton width="80%" height={14} />
          <Skeleton width={60} height={32} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton variant="rectangular" height={8} className="rounded-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex gap-4">
          <Skeleton width="20%" height={16} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="25%" height={16} />
          <Skeleton width="25%" height={16} />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton width="20%" height={16} />
            <Skeleton width="30%" height={16} />
            <Skeleton width="25%" height={16} />
            <Skeleton width="25%" height={16} />
          </div>
        ))}
      </div>
    </div>
  )
}