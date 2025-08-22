/**
 * Pending Invites Component
 * Displays and manages pending invitations
 */

import React from 'react';
import { Mail, Clock, User, Copy, X } from 'lucide-react';
import type { PendingInvite } from '../../types/admin.types';

interface PendingInvitesProps {
  invites: PendingInvite[];
  onCopyCode?: (code: string) => void;
  onCancelInvite?: (email: string) => void;
}

export const PendingInvites: React.FC<PendingInvitesProps> = ({ 
  invites, 
  onCopyCode,
  onCancelInvite 
}) => {
  const formatExpiry = (expiresAt: Date) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Expires soon';
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    if (onCopyCode) onCopyCode(code);
  };

  if (invites.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No pending invitations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pending Invites</h3>
        <span className="text-sm text-gray-500">{invites.length} pending</span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {invites.map((invite, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-sm">{invite.email}</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {invite.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatExpiry(invite.expiresAt)}
                  </span>
                </div>
                
                {invite.sentBy && (
                  <p className="text-xs text-gray-400 mt-1">
                    Sent by: {invite.sentBy}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(invite.inviteCode)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Copy invite code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {onCancelInvite && (
                  <button
                    onClick={() => onCancelInvite(invite.email)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Cancel invite"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
              {invite.inviteCode}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};