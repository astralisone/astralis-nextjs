'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star, Zap, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import type { AutomationTemplate } from '@/types/automation';

interface TemplateCardProps {
  template: AutomationTemplate;
  onDeploy: (templateId: string) => Promise<void>;
  onPreview?: (template: AutomationTemplate) => void;
}

const categoryLabels: Record<string, string> = {
  LEAD_MANAGEMENT: 'Lead Management',
  CUSTOMER_ONBOARDING: 'Customer Onboarding',
  REPORTING: 'Reporting',
  NOTIFICATIONS: 'Notifications',
  DATA_SYNC: 'Data Sync',
  CONTENT_PUBLISHING: 'Content Publishing',
  INVOICING: 'Invoicing',
  SUPPORT_AUTOMATION: 'Support Automation',
  SALES_PIPELINE: 'Sales Pipeline',
  MARKETING: 'Marketing',
  HR_OPERATIONS: 'HR Operations',
  OTHER: 'Other',
};

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const;

export function TemplateCard({ template, onDeploy, onPreview }: TemplateCardProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeploying(true);
    try {
      await onDeploy(template.id);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(template);
    }
  };

  return (
    <Card
      variant="default"
      hover
      className={cn(
        'cursor-pointer transition-all duration-200 h-full flex flex-col',
        isHovered && 'border-astralis-blue shadow-card-hover',
        isDeploying && 'opacity-60 pointer-events-none'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
        {/* Background Image */}
        {template.thumbnailUrl ? (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${template.thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-astralis-navy via-astralis-blue to-astralis-cyan" />
        )}

        {/* Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-astralis-navy/60 via-astralis-blue/50 to-transparent" />

        {/* Fallback Icon (only if no image) */}
        {!template.thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-12 h-12 text-white/30" />
          </div>
        )}

        {/* Official Badge */}
        {template.isOfficial && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="primary" className="bg-white text-astralis-blue border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Official
            </Badge>
          </div>
        )}

        {/* Rating */}
        {template.rating > 0 && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-astralis-navy">
              {template.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
          <Badge variant={difficultyColors[template.difficulty]} className="text-xs capitalize shrink-0">
            {template.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[template.category] || template.category}
          </Badge>
          {template.useCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp className="w-3 h-3" />
              <span>{template.useCount} uses</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <CardDescription className="line-clamp-3 text-sm">
          {template.description}
        </CardDescription>

        {/* Required Integrations */}
        {template.requiredIntegrations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Required Integrations:</p>
            <div className="flex flex-wrap gap-1">
              {template.requiredIntegrations.slice(0, 3).map((integration) => (
                <Badge key={integration} variant="default" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {template.requiredIntegrations.length > 3 && (
                <Badge variant="default" className="text-xs">
                  +{template.requiredIntegrations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="text-xs text-slate-500">+{template.tags.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-200">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleDeploy}
          disabled={isDeploying}
        >
          {isDeploying ? (
            'Deploying...'
          ) : (
            <>
              Deploy Template
              <ArrowRight className=" ui-icon w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
