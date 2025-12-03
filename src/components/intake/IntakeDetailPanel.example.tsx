/**
 * IntakeDetailPanel Usage Example
 *
 * This file demonstrates how to integrate the IntakeDetailPanel component
 * into a page with a table, showing the slide-in behavior.
 */

'use client';

import { useState } from 'react';
import { IntakeDetailPanel } from './IntakeDetailPanel';
import { IntakeRequest } from '@/types/pipelines';

interface ExamplePageProps {
  // This would come from your API/database
  intakeRequests: IntakeRequest[];
  pipelines: Array<{ id: string; name: string }>;
}

export function IntakePageWithPanel({ intakeRequests, pipelines }: ExamplePageProps) {
  const [selectedIntake, setSelectedIntake] = useState<IntakeRequest | null>(null);

  const handleStatusChange = async (status: string) => {
    if (!selectedIntake) return;

    // Make API call to update status
    const response = await fetch(`/api/intake/${selectedIntake.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      // Update local state or refetch data
      console.log('Status updated successfully');
    }
  };

  const handlePipelineAssign = async (pipelineId: string) => {
    if (!selectedIntake) return;

    // Make API call to assign pipeline
    const response = await fetch(`/api/intake/${selectedIntake.id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineId }),
    });

    if (response.ok) {
      console.log('Pipeline assigned successfully');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Table Area - shrinks when panel is open */}
      <div
        className={`flex-1 transition-all duration-300 ${
          selectedIntake ? 'mr-96' : 'mr-0'
        }`}
      >
        {/* Your intake table component */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-astralis-navy mb-4">
            Intake Requests
          </h2>

          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              {intakeRequests.map((intake) => (
                <tr
                  key={intake.id}
                  onClick={() => setSelectedIntake(intake)}
                  className={`cursor-pointer hover:bg-slate-50 ${
                    selectedIntake?.id === intake.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-2">{intake.title}</td>
                  <td className="px-4 py-2">{intake.status}</td>
                  <td className="px-4 py-2">{intake.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel - slides in from right */}
      {selectedIntake && (
        <div
          className="fixed right-0 top-0 w-96 h-full animate-in slide-in-from-right duration-300"
        >
          <IntakeDetailPanel
            intake={selectedIntake}
            pipelines={pipelines}
            onClose={() => setSelectedIntake(null)}
            onStatusChange={handleStatusChange}
            onPipelineAssign={handlePipelineAssign}
          />
        </div>
      )}
    </div>
  );
}
