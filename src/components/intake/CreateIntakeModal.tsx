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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateIntake } from '@/hooks/useIntakeMutations';

const createIntakeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  source: z.enum(['FORM', 'EMAIL', 'CHAT', 'API']),
  priority: z.coerce.number().int().min(0).max(10),
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
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'FORM' | 'EMAIL' | 'CHAT' | 'API'>('FORM');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateIntakeFormData>({
    resolver: zodResolver(createIntakeSchema),
    defaultValues: {
      source: 'FORM',
      priority: 0,
    },
  });

  const onSubmit = async (data: CreateIntakeFormData) => {
    if (!session?.user?.orgId) {
      setError('Organization ID not found. Please sign in again.');
      return;
    }

    setError(null);

    try {
      await createIntake.mutateAsync({
        title: data.title,
        description: data.description,
        source: data.source,
        priority: data.priority,
        requestData: {
          createdBy: session.user.email,
          createdAt: new Date().toISOString(),
        },
        orgId: session.user.orgId,
      });

      reset();
      setSource('FORM');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create intake request';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!createIntake.isPending) {
      reset();
      setSource('FORM');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Intake Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the request..."
              rows={4}
              {...register('description')}
              disabled={createIntake.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">
              Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={source}
              onValueChange={(value: 'FORM' | 'EMAIL' | 'CHAT' | 'API') => {
                setSource(value);
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
              defaultValue="0"
              {...register('priority', { valueAsNumber: true })}
              disabled={createIntake.isPending}
            />
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <DialogFooter>
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
              {createIntake.isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
