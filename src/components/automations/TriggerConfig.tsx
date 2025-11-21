'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Webhook, Calendar, Zap } from 'lucide-react';
import type { AutomationTrigger } from '@/types/automation';

interface TriggerConfigProps {
  triggerType: AutomationTrigger;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  webhookUrl?: string;
}

export function TriggerConfig({
  triggerType,
  config,
  onChange,
  webhookUrl,
}: TriggerConfigProps) {
  const [copied, setCopied] = useState(false);

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (triggerType === 'WEBHOOK') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-astralis-blue">
          <Webhook className="w-5 h-5" />
          <h3 className="font-semibold">Webhook Trigger</h3>
        </div>

        <Alert variant="info" showIcon>
          <AlertDescription>
            Send POST requests to this webhook URL to trigger the automation. Include your
            data in the request body as JSON.
          </AlertDescription>
        </Alert>

        {webhookUrl && (
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
                title="Copy webhook URL"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-slate-900 text-slate-50 p-4 rounded-lg">
          <p className="text-xs text-slate-400 mb-2">Example cURL request:</p>
          <pre className="text-xs overflow-x-auto">
            {`curl -X POST ${webhookUrl || 'YOUR_WEBHOOK_URL'} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }'`}
          </pre>
        </div>
      </div>
    );
  }

  if (triggerType === 'SCHEDULE') {
    const [cronExpression, setCronExpression] = useState(
      config.cronExpression || '0 9 * * *'
    );
    const [timezone, setTimezone] = useState(config.timezone || 'America/New_York');

    const handleUpdate = () => {
      onChange({
        cronExpression,
        timezone,
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-astralis-blue">
          <Calendar className="w-5 h-5" />
          <h3 className="font-semibold">Schedule Trigger</h3>
        </div>

        <Alert variant="info" showIcon>
          <AlertDescription>
            This automation will run automatically based on the schedule you define using cron
            syntax.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="cronExpression">Cron Expression</Label>
          <Input
            id="cronExpression"
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            placeholder="0 9 * * *"
            className="font-mono"
          />
          <p className="text-xs text-slate-500">
            Current: Run daily at 9:00 AM
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="primary" onClick={handleUpdate}>
          Update Schedule
        </Button>

        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium text-slate-900">Common Cron Patterns:</p>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <code className="bg-white px-2 py-1 rounded">0 9 * * *</code>
              <span>Daily at 9:00 AM</span>
            </div>
            <div className="flex justify-between">
              <code className="bg-white px-2 py-1 rounded">0 */6 * * *</code>
              <span>Every 6 hours</span>
            </div>
            <div className="flex justify-between">
              <code className="bg-white px-2 py-1 rounded">0 9 * * 1</code>
              <span>Every Monday at 9:00 AM</span>
            </div>
            <div className="flex justify-between">
              <code className="bg-white px-2 py-1 rounded">0 0 1 * *</code>
              <span>First day of month at midnight</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (triggerType === 'EVENT') {
    const [eventType, setEventType] = useState(config.eventType || 'DOCUMENT_UPLOADED');
    const [filters, setFilters] = useState(config.filters || {});

    const handleUpdate = () => {
      onChange({
        eventType,
        filters,
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-astralis-blue">
          <Zap className="w-5 h-5" />
          <h3 className="font-semibold">Event Trigger</h3>
        </div>

        <Alert variant="info" showIcon>
          <AlertDescription>
            This automation will run automatically when specific events occur in your system.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="eventType">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTAKE_CREATED">New Intake Request Created</SelectItem>
              <SelectItem value="INTAKE_ASSIGNED">Intake Request Assigned</SelectItem>
              <SelectItem value="DOCUMENT_UPLOADED">Document Uploaded</SelectItem>
              <SelectItem value="DOCUMENT_PROCESSED">Document Processed</SelectItem>
              <SelectItem value="PIPELINE_STAGE_CHANGED">Pipeline Stage Changed</SelectItem>
              <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
              <SelectItem value="EMAIL_RECEIVED">Email Received</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filterConditions">Filter Conditions (Optional)</Label>
          <Input
            id="filterConditions"
            placeholder='{"status": "urgent"}'
            value={JSON.stringify(filters)}
            onChange={(e) => {
              try {
                setFilters(JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500">
            Add conditions in JSON format to filter which events trigger this automation.
          </p>
        </div>

        <Button variant="primary" onClick={handleUpdate}>
          Update Event Trigger
        </Button>
      </div>
    );
  }

  if (triggerType === 'MANUAL') {
    return (
      <div className="space-y-4">
        <Alert variant="info" showIcon>
          <AlertDescription>
            This automation will only run when manually triggered. You can execute it from the
            automation detail page or via the API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Alert variant="default">
      <AlertDescription>
        Trigger type configuration not available yet.
      </AlertDescription>
    </Alert>
  );
}
