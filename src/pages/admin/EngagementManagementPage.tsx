/**
 * Engagement Management Page
 * Admin page for managing client engagements
 */

import React from 'react';
import { EngagementManagement } from '@/components/admin/EngagementManagement';

export default function EngagementManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <EngagementManagement />
      </div>
    </div>
  );
}
