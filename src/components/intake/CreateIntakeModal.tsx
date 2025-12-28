'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateIntake } from '@/hooks/useIntakeMutations';
import { useTaskTemplates } from '@/hooks/useTaskTemplates';
import { TASK_INPUT_DEFINITIONS, FormField } from './task-schemas';
import { Loader2 } from 'lucide-react';

const createIntakeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  source: z.enum(['FORM', 'EMAIL', 'CHAT', 'API']),
  priority: z.coerce.number().int().min(0).max(10),
  taskTypeId: z.string().optional(),
  // Dynamic fields will be collected separately
});

type CreateIntakeFormData = z.infer<typeof createIntakeSchema>;

interface CreateIntakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateIntakeModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateIntakeModalProps) {
  const { data: session } = useSession();
  const createIntake = useCreateIntake();
  const { templates, isLoading: isLoadingTemplates } = useTaskTemplates();
  const [error, setError] = useState<string | null>(null);

  // State for dynamic form fields
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string>('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateIntakeFormData>({
    resolver: zodResolver(createIntakeSchema),
    defaultValues: {
      source: 'FORM',
      priority: 0,
    },
  });

  const source = watch('source');

  const handleDynamicChange = (key: string, value: any) => {
    setDynamicValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const onSubmit = async (data: CreateIntakeFormData) => {
    if (!session?.user?.orgId) {
      setError('Organization ID not found. Please sign in again.');
      return;
    }

    // Validate required dynamic fields
    if (selectedTaskTypeId) {
      const definitions = TASK_INPUT_DEFINITIONS[selectedTaskTypeId] || [];
      for (const field of definitions) {
        if (field.required && !dynamicValues[field.name]) {
          setError(`Please fill in required field: ${field.label}`);
          return;
        }
      }
    }

    setError(null);

    try {
      // Find selected template to get label/category mainly for metadata
      const selectedTemplate = templates.find(t => t.id === selectedTaskTypeId);

      await createIntake.mutateAsync({
        title: data.title,
        description: data.description,
        source: data.source,
        priority: data.priority,
        requestData: {
          createdBy: session.user.email,
          createdAt: new Date().toISOString(),
          taskTypeId: selectedTaskTypeId || undefined,
          taskTypeLabel: selectedTemplate?.label,
          ...dynamicValues, // Include dynamic field data
        },
        orgId: session.user.orgId,
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create intake request';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!createIntake.isPending) {
      reset();
      setSelectedTaskTypeId('');
      setDynamicValues({});
      setError(null);
      onOpenChange(false);
    }
  };

  const renderDynamicField = (field: FormField) => {
    const value = dynamicValues[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
            disabled={createIntake.isPending}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            id={field.name}
            type="date"
            value={value}
            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
            disabled={createIntake.isPending}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
            rows={3}
            disabled={createIntake.isPending}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleDynamicChange(field.name, val)}
            disabled={createIntake.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleDynamicChange(field.name, checked)}
              disabled={createIntake.isPending}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  const activeFields = selectedTaskTypeId ? TASK_INPUT_DEFINITIONS[selectedTaskTypeId] || [] : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Intake Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">
                Request Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., New Customer Support Request"
                {...register('title')}
                disabled={createIntake.isPending}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={selectedTaskTypeId}
                onValueChange={(val) => {
                  setSelectedTaskTypeId(val);
                  setDynamicValues({}); // Reset dynamic values when type changes
                  setValue('taskTypeId', val);
                }}
                disabled={createIntake.isPending || isLoadingTemplates}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a task type..."} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="GENERIC">Generic / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Fields Section */}
          {activeFields.length > 0 && (
            <div className="rounded-md bg-slate-50 p-4 border border-slate-200 space-y-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-2">
                Task Details
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {activeFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderDynamicField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the request..."
              rows={3}
              {...register('description')}
              disabled={createIntake.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">
                Source <span className="text-red-500">*</span>
              </Label>
              <Select
                value={source}
                onValueChange={(value: 'FORM' | 'EMAIL' | 'CHAT' | 'API') => {
                  setValue('source', value);
                }}
                disabled={createIntake.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORM">Form Submission</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="CHAT">Chat</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="10"
                {...register('priority', { valueAsNumber: true })}
                disabled={createIntake.isPending}
              />
              {errors.priority && (
                <p className="text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createIntake.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createIntake.isPending}
            >
              {createIntake.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createIntake.isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
