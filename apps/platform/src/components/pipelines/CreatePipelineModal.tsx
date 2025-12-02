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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreatePipeline } from '@/hooks/usePipelineMutations';

const createPipelineSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type CreatePipelineFormData = z.infer<typeof createPipelineSchema>;

interface CreatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePipelineModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePipelineModalProps) {
  const { data: session } = useSession();
  const createPipeline = useCreatePipeline();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePipelineFormData>({
    resolver: zodResolver(createPipelineSchema),
  });

  const onSubmit = async (data: CreatePipelineFormData) => {
    if (!session?.user?.orgId) {
      setError('Organization ID not found. Please sign in again.');
      return;
    }

    setError(null);

    try {
      await createPipeline.mutateAsync({
        name: data.name,
        description: data.description,
        orgId: session.user.orgId,
      });

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pipeline';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!createPipeline.isPending) {
      reset();
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Pipeline</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Pipeline Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Sales Pipeline"
              {...register('name')}
              disabled={createPipeline.isPending}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this pipeline..."
              rows={4}
              {...register('description')}
              disabled={createPipeline.isPending}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPipeline.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createPipeline.isPending}
            >
              {createPipeline.isPending ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
