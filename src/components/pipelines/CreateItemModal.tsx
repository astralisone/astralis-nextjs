'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PipelinePriority, PipelineItemStatus } from '@/types/pipelines';

interface CreateItemModalProps {
  pipelineId: string;
  stageId: string;
  stageName: string;
  onItemCreated?: () => void;
  trigger?: React.ReactNode;
}

interface FormData {
  title: string;
  description: string;
  priority: PipelinePriority;
  status: PipelineItemStatus;
  dueDate: string;
  tags: string;
}

const priorityOptions = [
  { value: PipelinePriority.NONE, label: 'None', color: 'text-slate-600' },
  { value: PipelinePriority.LOW, label: 'Low', color: 'text-blue-600' },
  { value: PipelinePriority.MEDIUM, label: 'Medium', color: 'text-yellow-600' },
  { value: PipelinePriority.HIGH, label: 'High', color: 'text-orange-600' },
  { value: PipelinePriority.URGENT, label: 'Urgent', color: 'text-red-600' },
];

const statusOptions = [
  { value: PipelineItemStatus.NOT_STARTED, label: 'Not Started' },
  { value: PipelineItemStatus.IN_PROGRESS, label: 'In Progress' },
  { value: PipelineItemStatus.BLOCKED, label: 'Blocked' },
  { value: PipelineItemStatus.COMPLETED, label: 'Completed' },
];

export function CreateItemModal({
  pipelineId,
  stageId,
  stageName,
  onItemCreated,
  trigger,
}: CreateItemModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: PipelinePriority.NONE,
    status: PipelineItemStatus.NOT_STARTED,
    dueDate: '',
    tags: '',
  });

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      title: '',
      description: '',
      priority: PipelinePriority.NONE,
      status: PipelineItemStatus.NOT_STARTED,
      dueDate: '',
      tags: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(`/api/pipelines/${pipelineId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || null,
          tags: tagsArray,
          stageId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }

      onItemCreated?.();
      handleClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-sm">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Item</DialogTitle>
            <DialogDescription>
              Add a new item to <span className="font-medium">{stageName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter item title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this item..."
                rows={4}
              />
            </div>

            {/* Priority and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: Number(e.target.value) as PipelinePriority,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as PipelineItemStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="e.g., bug, feature, urgent (comma-separated)"
              />
              <p className="text-xs text-slate-500">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
