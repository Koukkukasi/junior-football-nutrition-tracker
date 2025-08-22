/**
 * Bulk invitation form component
 */

import { Users } from 'lucide-react';

interface BulkInviteFormProps {
  bulkEmails: string;
  role: 'PLAYER' | 'COACH';
  teamCode: string;
  isLoading: boolean;
  onEmailsChange: (emails: string) => void;
  onRoleChange: (role: 'PLAYER' | 'COACH') => void;
  onTeamCodeChange: (code: string) => void;
  onSubmit: () => void;
}

export function BulkInviteForm({
  bulkEmails,
  role,
  teamCode,
  isLoading,
  onEmailsChange,
  onRoleChange,
  onTeamCodeChange,
  onSubmit
}: BulkInviteFormProps) {
  const emailCount = bulkEmails
    .split(/[\n,;]/)
    .map(e => e.trim())
    .filter(e => e.includes('@')).length;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Bulk Invitations
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role for All
            </label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as 'PLAYER' | 'COACH')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              value={teamCode}
              onChange={(e) => onTeamCodeChange(e.target.value)}
              placeholder="TEST-TEAM-2024"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Addresses ({emailCount} valid)
          </label>
          <textarea
            value={bulkEmails}
            onChange={(e) => onEmailsChange(e.target.value)}
            placeholder="Enter multiple emails (one per line or comma-separated)&#10;example1@test.com&#10;example2@test.com&#10;example3@test.com"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || !bulkEmails.trim()}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isLoading || !bulkEmails.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Send {emailCount > 0 ? `${emailCount} ` : ''}Invitations
            </>
          )}
        </button>
      </div>
    </div>
  );
}