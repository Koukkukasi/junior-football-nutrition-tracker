/**
 * System Health Component
 * Displays system status and health indicators
 */

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Database, Globe, Shield } from 'lucide-react';
import type { SystemHealth } from '../../types/admin.types';

interface SystemHealthProps {
  health?: SystemHealth;
  lastUpdate: Date;
  onRefresh: () => void;
}

export const SystemHealthComponent: React.FC<SystemHealthProps> = ({ 
  health = {
    database: 'healthy',
    api: 'healthy',
    auth: 'healthy'
  },
  lastUpdate,
  onRefresh 
}) => {
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
    }
  };

  const services = [
    { name: 'Database', status: health.database, icon: Database },
    { name: 'API', status: health.api, icon: Globe },
    { name: 'Authentication', status: health.auth, icon: Shield }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">System Health</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div 
              key={service.name}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(service.status)}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className="text-sm capitalize">{service.status}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};