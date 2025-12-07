'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IntegrationsGrid } from '@/components/integrations';
import { ArrowLeft, Plug, Zap, Shield, RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/automations">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-astralis-navy">Integrations</h1>
              <p className="text-slate-600 mt-1">
                Connect your favorite tools and services to automate workflows
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Plug className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-astralis-navy">Easy Setup</h3>
                <p className="text-sm text-slate-600">
                  Connect in seconds with secure OAuth authentication
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-astralis-navy">Powerful Actions</h3>
                <p className="text-sm text-slate-600">
                  Send messages, sync data, and automate tasks
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-astralis-navy">Enterprise Security</h3>
                <p className="text-sm text-slate-600">
                  Credentials encrypted with AES-256-GCM
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Integrations Grid */}
        <Suspense fallback={<IntegrationsGridSkeleton />}>
          <IntegrationsGrid />
        </Suspense>

        {/* Help Card */}
        <Card className="bg-astralis-blue/5 border-astralis-blue/20">
          <div className="p-6">
            <h3 className="font-semibold text-astralis-navy mb-2">
              Need help setting up integrations?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Check our documentation for step-by-step guides on connecting each integration,
              including OAuth setup and API key configuration.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/docs/integrations" target="_blank">
                  View Documentation
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function IntegrationsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-64">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
