/**
 * Component for displaying invitation results
 */

import { CheckCircle, Copy, AlertCircle } from 'lucide-react';
import type { InviteResult, Invitation } from '../../types/admin.types';

interface InviteResultsProps {
  result: InviteResult | null;
  error: string;
  onCopyUrl: (url: string) => void;
}

export function InviteResults({ result, error, onCopyUrl }: InviteResultsProps) {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const handleCopyClick = (url: string | undefined, buttonElement: HTMLButtonElement) => {
    if (!url) return;
    
    onCopyUrl(url);
    
    // Visual feedback
    const originalContent = buttonElement.innerHTML;
    buttonElement.innerHTML = 'Copied!';
    buttonElement.classList.add('text-green-600');
    
    setTimeout(() => {
      buttonElement.innerHTML = originalContent;
      buttonElement.classList.remove('text-green-600');
    }, 2000);
  };

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-green-800 font-semibold">
            {result.invitations 
              ? `${result.invitations.length} invitations sent successfully!`
              : 'Invitation sent successfully!'}
          </p>
          {result.message && (
            <p className="text-green-700 text-sm mt-1">
              {result.message}
            </p>
          )}
        </div>
      </div>

      {result.invitations ? (
        // Bulk results
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {result.invitations.map((inv: Invitation, idx: number) => (
            <div key={idx} className="bg-white p-3 rounded border border-green-300">
              <p className="text-sm font-mono text-gray-700">{inv.email}</p>
              {inv.inviteUrl && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={inv.inviteUrl}
                    readOnly
                    className="flex-1 text-xs p-1 bg-gray-50 rounded font-mono"
                  />
                  <button
                    onClick={(e) => handleCopyClick(inv.inviteUrl, e.currentTarget)}
                    className="text-blue-600 hover:text-blue-800 text-xs p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
              {inv.error && (
                <p className="text-xs text-red-600 mt-1">{inv.error}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Single result
        <div className="space-y-3">
          {result.inviteUrl && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Invitation URL:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={result.inviteUrl}
                  readOnly
                  className="flex-1 p-2 bg-white rounded border border-gray-300 font-mono text-sm"
                />
                <button
                  onClick={(e) => handleCopyClick(result.inviteUrl, e.currentTarget)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {result.successCount !== undefined && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Successful:</span>
                <p className="font-medium text-green-600">{result.successCount}</p>
              </div>
              {result.failedCount !== undefined && result.failedCount > 0 && (
                <div>
                  <span className="text-gray-600">Failed:</span>
                  <p className="font-medium text-red-600">{result.failedCount}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}