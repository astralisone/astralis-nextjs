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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatePipeline } from '@/hooks/usePipelineMutations';
import { DEFAULT_PIPELINES, type DefaultPipelineDefinition } from '@/lib/services/defaultPipelines.service';
import { PipelineType } from '@prisma/client';
import { CheckCircle2, ArrowRight, LayoutGrid } from 'lucide-react';

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

type ModalStep = 'template' | 'customize';

export function CreatePipelineModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePipelineModalProps) {
  const { data: session } = useSession();
  const createPipeline = useCreatePipeline();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<ModalStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<DefaultPipelineDefinition | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreatePipelineFormData>({
    resolver: zodResolver(createPipelineSchema),
  });

  const onSubmit = async (data: CreatePipelineFormData) => {
    if (!session?.user?.orgId) {
      setError('Organization ID not found. Please sign in again.');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setError(null);

    try {
      // Create pipeline with template type
      await createPipeline.mutateAsync({
        name: data.name,
        description: data.description,
        orgId: session.user.orgId,
        templateKey: selectedTemplate.key,
      });

      handleReset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pipeline';
      setError(errorMessage);
    }
  };

  const handleTemplateSelect = (template: DefaultPipelineDefinition) => {
    setSelectedTemplate(template);

    // Pre-fill form with template data
    if (template.type !== 'CUSTOM') {
      setValue('name', template.name);
      setValue('description', template.description);
    } else {
      setValue('name', '');
      setValue('description', '');
    }

    setStep('customize');
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleReset = () => {
    reset();
    setError(null);
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    if (!createPipeline.isPending) {
      handleReset();
      onOpenChange(false);
    }
  };

  // Get icon color based on template type
  const getTemplateIconColor = (type: PipelineType): string => {
    switch (type) {
      case 'SALES':
        return 'text-green-600 bg-green-50';
      case 'SUPPORT':
        return 'text-blue-600 bg-blue-50';
      case 'BILLING':
        return 'text-purple-600 bg-purple-50';
      case 'INTERNAL':
        return 'text-orange-600 bg-orange-50';
      case 'GENERIC':
        return 'text-slate-600 bg-slate-50';
      case 'CUSTOM':
        return 'text-astralis-blue bg-blue-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'template' ? 'Choose Pipeline Template' : 'Customize Pipeline'}
          </DialogTitle>
        </DialogHeader>

        {step === 'template' && (
          <div className="space-y-4">
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {DEFAULT_PIPELINES.map((template) => (
                <Card
                  key={template.key}
                  className="cursor-pointer transition-all duration-200 hover:border-astralis-blue hover:shadow-md"
                  onClick={() => handleTemplateSelect(template)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect(template);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-astralis-navy flex items-center gap-2">
                          <div className={`p-2 rounded-md ${getTemplateIconColor(template.type)}`}>
                            <LayoutGrid className="h-[24px] w-[24px]" />
                          </div>
                          {template.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-600 font-medium">
                        {template.stages.length} Stages:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.stages.slice(0, 4).map((stage) => (
                          <span
                            key={stage.key}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${stage.color}20`,
                              color: stage.color,
                            }}
                          >
                            {stage.name}
                          </span>
                        ))}
                        {template.stages.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            +{template.stages.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'customize' && selectedTemplate && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${getTemplateIconColor(selectedTemplate.type)}`}>
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-astralis-navy">
                    {selectedTemplate.name} Template
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedTemplate.description}
                  </p>
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 font-medium mb-2">
                      Includes {selectedTemplate.stages.length} stages:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.stages.map((stage) => (
                        <span
                          key={stage.key}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${stage.color}20`,
                            color: stage.color,
                          }}
                        >
                          <CheckCircle2 className="h-5 w-5 mr-1" />
                          {stage.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Pipeline Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder={
                  selectedTemplate.type === 'CUSTOM'
                    ? 'Enter custom pipeline name'
                    : selectedTemplate.name
                }
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
                rows={3}
                {...register('description')}
                disabled={createPipeline.isPending}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={createPipeline.isPending}
              >
                Back
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
        )}
      </DialogContent>
    </Dialog>
  );
}
