import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'chart' | 'table';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  count = 1 
}) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full mb-2';
      case 'card':
        return 'h-32 w-full mb-4';
      case 'chart':
        return 'h-64 w-full mb-4';
      case 'table':
        return 'h-12 w-full mb-2';
      default:
        return 'h-4 w-full mb-2';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`${baseClass} ${getVariantClass()} ${className}`}
        />
      ))}
    </>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-64 mb-2" />
        <Skeleton variant="text" className="h-4 w-96" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton variant="card" count={3} />
      </div>
      
      <Skeleton variant="chart" />
    </div>
  );
};

export const FoodLogSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Skeleton variant="text" className="h-8 w-48 mb-4" />
        <Skeleton variant="card" className="h-24" />
      </div>
      
      <div className="space-y-4">
        <Skeleton variant="table" count={5} />
      </div>
    </div>
  );
};

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-64 mb-2" />
        <Skeleton variant="text" className="h-4 w-96" />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Skeleton variant="card" className="h-24" count={4} />
      </div>
      
      {/* Tabs */}
      <div className="mb-4">
        <Skeleton variant="text" className="h-10 w-full" />
      </div>
      
      {/* Content */}
      <Skeleton variant="chart" />
    </div>
  );
};

export default Skeleton;