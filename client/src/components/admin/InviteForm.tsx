/**
 * Single invitation form component
 */

import { Send } from 'lucide-react';
import type { InviteFormData } from '../../types/admin.types';

interface InviteFormProps {
  formData: InviteFormData;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof InviteFormData, value: string) => void;
  onQuickFill?: () => void;
}

export function InviteForm({ 
  formData, 
  isLoading, 
  onSubmit, 
  onChange,
  onQuickFill 
}: InviteFormProps) {
  return (
    <>
      {onQuickFill && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Test Invite</h3>
          <button
            onClick={onQuickFill}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Set to ilmivalta@gmail.com
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
            placeholder="user@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => onChange('role', e.target.value as 'PLAYER' | 'COACH')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PLAYER">Player</option>
              <option value="COACH">Coach</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Code (Optional)
            </label>
            <input
              type="text"
              value={formData.teamCode}
              onChange={(e) => onChange('teamCode', e.target.value)}
              placeholder="TEST-TEAM-2024"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <textarea
            value={formData.customMessage}
            onChange={(e) => onChange('customMessage', e.target.value)}
            placeholder="Add a personal message to the invitation..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.email}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isLoading || !formData.email
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Invitation
            </>
          )}
        </button>
      </form>
    </>
  );
}