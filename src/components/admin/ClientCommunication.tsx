"use client";

/**
 * Client Communication Component
 * Email integration for communicating with clients
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Send,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks';
import api from '@/lib/api';

// Types
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  isPrimary: boolean;
}

interface Engagement {
  id: string;
  name: string;
  status: string;
  company: {
    id: string;
    name: string;
  };
  contacts: Contact[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'welcome' | 'update' | 'milestone' | 'completion' | 'custom';
}

interface ClientCommunicationProps {
  engagement: Engagement;
  trigger?: React.ReactNode;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome & Project Kickoff',
    subject: 'Welcome to Astralis - {{engagementName}} Project Kickoff',
    body: `Dear {{clientName}},

Welcome to Astralis! We're excited to begin working on the {{engagementName}} project with {{companyName}}.

This email confirms that we've received your project details and our team is ready to get started. Here's what happens next:

1. **Project Setup**: Our team will set up the necessary development environments and access
2. **Initial Planning**: We'll schedule a kickoff meeting to align on project goals and timeline
3. **Regular Updates**: You'll receive weekly progress updates and have access to our project dashboard

**Project Details:**
- Project Name: {{engagementName}}
- Company: {{companyName}}
- Status: {{status}}

If you have any questions or need to discuss anything, please don't hesitate to reach out to me directly.

Looking forward to a successful partnership!

Best regards,
The Astralis Team`,
    category: 'welcome'
  },
  {
    id: 'milestone',
    name: 'Milestone Completion',
    subject: 'Milestone Completed - {{engagementName}}',
    body: `Dear {{clientName}},

Great news! We've successfully completed a major milestone for the {{engagementName}} project.

**Milestone Details:**
- Project: {{engagementName}}
- Company: {{companyName}}
- Completed: [Milestone Name]
- Next Steps: [Next milestone or phase]

**What's Been Delivered:**
[List of deliverables]

**Next Steps:**
[Outline next phase]

You can review the completed work and provide feedback through our project portal. We'll schedule a review meeting to walk through the deliverables and discuss next steps.

Thank you for your continued trust in Astralis!

Best regards,
The Astralis Team`,
    category: 'milestone'
  },
  {
    id: 'update',
    name: 'Weekly Progress Update',
    subject: 'Weekly Update - {{engagementName}} Progress',
    body: `Dear {{clientName}},

Here's your weekly progress update for the {{engagementName}} project.

**This Week's Progress:**
- [Key accomplishments]
- [Features completed]
- [Issues resolved]

**Next Week's Goals:**
- [Planned tasks]
- [Upcoming milestones]
- [Expected deliverables]

**Project Status:**
- Overall Progress: [X]%
- Timeline: On track / Ahead / Behind
- Budget: [Status]

**Action Items:**
- [Any items requiring client input]
- [Scheduled meetings or reviews]

If you have any questions or concerns, please let us know. We're here to ensure the project's success!

Best regards,
The Astralis Team`,
    category: 'update'
  },
  {
    id: 'completion',
    name: 'Project Completion',
    subject: 'Project Completed - {{engagementName}}',
    body: `Dear {{clientName}},

Congratulations! We're pleased to announce the successful completion of the {{engagementName}} project.

**Project Summary:**
- Project: {{engagementName}}
- Company: {{companyName}}
- Completion Date: {{completionDate}}
- Final Status: {{status}}

**Deliverables:**
[List of all deliverables]

**Next Steps:**
- Final review and sign-off
- Documentation handover
- Support and maintenance transition (if applicable)

**Support:**
Our team remains available for any questions or support needs during the transition period.

Thank you for choosing Astralis for your project. We look forward to future opportunities to work together!

Best regards,
The Astralis Team`,
    category: 'completion'
  }
];

export function ClientCommunication({ engagement, trigger }: ClientCommunicationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'custom') {
      setIsCustom(true);
      setSelectedTemplate('');
      setSubject('');
      setBody('');
      return;
    }

    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setIsCustom(false);
      setSelectedTemplate(templateId);

      // Replace template variables
      const replacedSubject = template.subject
        .replace('{{engagementName}}', engagement.name)
        .replace('{{companyName}}', engagement.company.name);

      const replacedBody = template.body
        .replace(/{{engagementName}}/g, engagement.name)
        .replace(/{{companyName}}/g, engagement.company.name)
        .replace(/{{status}}/g, engagement.status)
        .replace(/{{clientName}}/g, engagement.contacts.find(c => c.isPrimary)?.firstName || 'Client');

      setSubject(replacedSubject);
      setBody(replacedBody);
    }
  };

  /**
   * Handle contact selection
   */
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  /**
   * Send email
   */
  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim() || selectedContacts.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields and select at least one recipient.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSending(true);

      await api.post('/admin/communications/send-email', {
        engagementId: engagement.id,
        contactIds: selectedContacts,
        subject,
        body,
        templateId: selectedTemplate || null
      });

      toast({
        title: 'Email Sent',
        description: `Email sent successfully to ${selectedContacts.length} recipient(s).`
      });

      // Reset form
      setSelectedContacts([]);
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setIsCustom(false);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast({
        title: 'Send Failed',
        description: error.response?.data?.message || 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Get primary contact
   */
  const primaryContact = engagement.contacts.find(c => c.isPrimary);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Contact Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Contact Client - {engagement.company.name}
          </DialogTitle>
          <DialogDescription>
            Send an email to the client contacts for {engagement.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Engagement Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">{engagement.company.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                <span>{engagement.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <Badge variant="secondary">{engagement.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              <Users className="w-4 h-4 inline mr-2" />
              Select Recipients
            </Label>
            <div className="grid gap-2">
              {engagement.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedContacts.includes(contact.id)
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-neutral-600 hover:border-neutral-500'
                  }`}
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded ${
                      selectedContacts.includes(contact.id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedContacts.includes(contact.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{contact.email}</div>
                      {contact.role && (
                        <div className="text-xs text-gray-500">{contact.role}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or write custom email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Email</SelectItem>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Composition */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={12}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* Preview Info */}
          {selectedContacts.length > 0 && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                This email will be sent to {selectedContacts.length} recipient(s): {' '}
                {engagement.contacts
                  .filter(c => selectedContacts.includes(c.id))
                  .map(c => `${c.firstName} ${c.lastName}`)
                  .join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSending || !subject.trim() || !body.trim() || selectedContacts.length === 0}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
