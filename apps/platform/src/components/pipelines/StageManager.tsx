'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PipelineStage } from '@/types/pipelines';
import { cn } from '@/lib/utils';

interface StageManagerProps {
  pipelineId: string;
  stages: PipelineStage[];
  onStagesChange?: () => void;
}

interface StageFormData {
  name: string;
  description: string;
  color: string;
}

const defaultColors = [
  '#64748b', // slate
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
];

export function StageManager({ pipelineId, stages, onStagesChange }: StageManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    color: defaultColors[0],
  });

  const handleOpen = (stage?: PipelineStage) => {
    if (stage) {
      setEditingStage(stage);
      setFormData({
        name: stage.name,
        description: stage.description || '',
        color: stage.color || defaultColors[0],
      });
    } else {
      setEditingStage(null);
      setFormData({
        name: '',
        description: '',
        color: defaultColors[0],
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingStage(null);
    setFormData({
      name: '',
      description: '',
      color: defaultColors[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStage) {
        // Update existing stage
        const response = await fetch(
          `/api/pipelines/${pipelineId}/stages/${editingStage.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error('Failed to update stage');
      } else {
        // Create new stage
        const response = await fetch(`/api/pipelines/${pipelineId}/stages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            order: stages.length, // Add to end
          }),
        });

        if (!response.ok) throw new Error('Failed to create stage');
      }

      onStagesChange?.();
      handleClose();
    } catch (error) {
      console.error('Error saving stage:', error);
      alert(error instanceof Error ? error.message : 'Failed to save stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (stageId: string) => {
    if (!confirm('Are you sure you want to delete this stage? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/pipelines/${pipelineId}/stages/${stageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete stage');
      }

      onStagesChange?.();
    } catch (error) {
      console.error('Error deleting stage:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete stage');
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Stage List */}
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            <button
              className="text-slate-400 hover:text-slate-600 cursor-grab"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-6 h-6" />
            </button>

            {stage.color && (
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{ backgroundColor: stage.color }}
              />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-astralis-navy truncate">
                {stage.name}
              </h4>
              {stage.description && (
                <p className="text-xs text-slate-500 truncate">
                  {stage.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpen(stage)}
                className="h-9 w-9"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(stage.id)}
                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Stage Button */}
        <Button
          variant="outline"
          onClick={() => handleOpen()}
          className="w-full"
        >
          <Plus className="w-6 h-6 mr-2" />
          Add Stage
        </Button>
      </div>

      {/* Stage Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingStage ? 'Edit Stage' : 'New Stage'}
              </DialogTitle>
              <DialogDescription>
                {editingStage
                  ? 'Update the stage details'
                  : 'Create a new stage in this pipeline'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stage Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Backlog, In Progress, Review"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this stage..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        formData.color === color
                          ? 'border-astralis-navy scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
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
                {isSubmitting
                  ? 'Saving...'
                  : editingStage
                  ? 'Update Stage'
                  : 'Create Stage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
