/**
 * Admin Invite Page - Refactored Version
 * Main container for sending test user invitations
 */

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useInviteManagement } from '../hooks/useInviteManagement';
import { InviteForm } from '../components/admin/InviteForm';
import { BulkInviteForm } from '../components/admin/BulkInviteForm';
import { InviteResults } from '../components/admin/InviteResults';
import { TestUserReference } from '../components/admin/TestUserReference';
import type { InviteFormData } from '../types/admin.types';

export default function AdminInvite() {
  const {
    isLoading,
    inviteResult,
    error,
    sendSingleInvite,
    sendBulkInvites,
    clearResults
  } = useInviteManagement();

  // Single invite form state
  const [formData, setFormData] = useState<InviteFormData>({
    email: 'ilmivalta@gmail.com',
    role: 'PLAYER',
    teamCode: 'TEST-TEAM-2024',
    customMessage: 'Welcome to our beta testing program! We\'re excited to have you test our nutrition tracking app.'
  });

  // Bulk invite state
  const [bulkEmails, setBulkEmails] = useState('');

  const handleFormChange = (field: keyof InviteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearResults(); // Clear any previous results when form changes
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendSingleInvite(formData);
    
    if (result.success) {
      // Clear email for next invite, keep other settings
      setFormData(prev => ({ ...prev, email: '' }));
    }
  };

  const handleBulkInvite = async () => {
    if (!bulkEmails.trim()) return;
    
    const emails = bulkEmails
      .split(/[\n,;]/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));
    
    const result = await sendBulkInvites(emails, formData.role, formData.teamCode);
    
    if (result.success) {
      setBulkEmails('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const setQuickTestEmail = () => {
    setFormData(prev => ({ ...prev, email: 'ilmivalta@gmail.com' }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Mail className="w-8 h-8 text-blue-600" />
          Send Test User Invitations
        </h1>

        {/* Single Invite Form */}
        <InviteForm
          formData={formData}
          isLoading={isLoading}
          onSubmit={handleSingleInvite}
          onChange={handleFormChange}
          onQuickFill={setQuickTestEmail}
        />

        {/* Bulk Invite Form */}
        <BulkInviteForm
          bulkEmails={bulkEmails}
          role={formData.role}
          teamCode={formData.teamCode}
          isLoading={isLoading}
          onEmailsChange={setBulkEmails}
          onRoleChange={(role) => handleFormChange('role', role)}
          onTeamCodeChange={(code) => handleFormChange('teamCode', code)}
          onSubmit={handleBulkInvite}
        />

        {/* Results Display */}
        <InviteResults
          result={inviteResult}
          error={error}
          onCopyUrl={copyToClipboard}
        />

        {/* Test User Reference */}
        <TestUserReference />
      </div>
    </div>
  );
}