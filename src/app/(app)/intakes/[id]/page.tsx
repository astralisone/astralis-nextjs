import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Tag, Clock, FileText, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IntakeSource, IntakeStatus } from '@/types/pipelines';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IntakeDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const intake = await prisma.intakeRequest.findUnique({
    where: { id: resolvedParams.id },
    include: {
      organization: { select: { name: true } },
      pipeline: { select: { id: true, name: true } },
    }
  });

  if (!intake) {
    notFound();
  }

  // Parse aiRoutingMeta safely
  const aiRoutingMeta = (intake.aiRoutingMeta as {
    confidence?: number;
    reasoning?: string;
    suggestedPipelines?: string[];
    routedAt?: string;
  } | null) || {};

  // Parse requestData safely
  const requestData = (intake.requestData as Record<string, unknown>) || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case IntakeStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case IntakeStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case IntakeStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case IntakeStatus.ROUTING:
        return 'bg-yellow-100 text-yellow-800';
      case IntakeStatus.NEW:
        return 'bg-orange-100 text-orange-800';
      case IntakeStatus.ASSIGNED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case IntakeSource.FORM:
        return '📝';
      case IntakeSource.EMAIL:
        return '📧';
      case IntakeSource.CHAT:
        return '💬';
      case IntakeSource.API:
        return '🔌';
      default:
        return '📄';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/pipelines" className="hover:text-slate-700 transition-colors">
          Pipelines
        </Link>
        <span>/</span>
        {intake.pipeline && (
          <>
            <Link
              href={`/pipelines/${intake.pipeline.id}`}
              className="hover:text-slate-700 transition-colors"
            >
              {intake.pipeline.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900">Intake Details</span>
      </nav>

      {/* Back button */}
      <Link href={intake.pipeline ? `/pipelines/${intake.pipeline.id}` : '/pipelines'}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className=" ui-icon w-5 h-5 mr-2" />
          Back to Pipeline
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy mb-2">
              {intake.title}
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              <span>{getSourceIcon(intake.source)}</span>
              <span>Created {new Date(intake.createdAt).toLocaleDateString()}</span>
              <span className="text-slate-300">•</span>
              <span>Source: {intake.source}</span>
            </p>
          </div>
          <Badge className={getStatusColor(intake.status)}>
            {intake.status}
          </Badge>
        </div>

        {intake.description && (
          <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-100">
            <p className="text-slate-700">{intake.description}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* AI Classification */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-astralis-navy">
            <Tag className="w-5 h-5" />
            AI Classification
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500 mb-1">Source Type</dt>
              <dd className="font-medium text-slate-900">{intake.source}</dd>
            </div>
            {aiRoutingMeta.confidence !== undefined && (
              <div>
                <dt className="text-sm text-slate-500 mb-1">Confidence</dt>
                <dd className="font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-astralis-blue rounded-full transition-all"
                        style={{ width: `${(aiRoutingMeta.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm">
                      {(aiRoutingMeta.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {aiRoutingMeta.reasoning && (
              <div>
                <dt className="text-sm text-slate-500 mb-1">AI Reasoning</dt>
                <dd className="text-sm bg-slate-50 p-3 rounded border border-slate-100 mt-1">
                  {aiRoutingMeta.reasoning}
                </dd>
              </div>
            )}
            {aiRoutingMeta.routedAt && (
              <div>
                <dt className="text-sm text-slate-500 mb-1">Routed At</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(aiRoutingMeta.routedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Routing Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-astralis-navy">
            <Activity className="w-5 h-5" />
            Routing
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500 mb-1">Assigned Pipeline</dt>
              <dd className="font-medium">
                {intake.pipeline ? (
                  <Link
                    href={`/pipelines/${intake.pipeline.id}`}
                    className="text-astralis-blue hover:underline inline-flex items-center gap-1"
                  >
                    {intake.pipeline.name}
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                ) : (
                  <span className="text-slate-400">Not assigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500 mb-1">Priority</dt>
              <dd className="font-medium text-slate-900">
                {intake.priority > 0 ? (
                  <Badge variant={intake.priority >= 3 ? 'error' : intake.priority >= 2 ? 'warning' : 'default'}>
                    Priority {intake.priority}
                  </Badge>
                ) : (
                  <Badge variant="default">Normal</Badge>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500 mb-1">Organization</dt>
              <dd className="font-medium text-slate-900">{intake.organization.name}</dd>
            </div>
            {aiRoutingMeta.suggestedPipelines && aiRoutingMeta.suggestedPipelines.length > 0 && (
              <div>
                <dt className="text-sm text-slate-500 mb-1">Suggested Pipelines</dt>
                <dd className="flex flex-wrap gap-1 mt-1">
                  {aiRoutingMeta.suggestedPipelines.map((pipelineId, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {pipelineId}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-astralis-navy">
          <Clock className="w-5 h-5" />
          Timeline
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Created</p>
              <p className="text-sm text-slate-500">
                {new Date(intake.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {intake.status !== IntakeStatus.NEW && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Status Changed</p>
                <p className="text-sm text-slate-500">
                  Current status: <Badge className={getStatusColor(intake.status)}>{intake.status}</Badge>
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Last Updated</p>
              <p className="text-sm text-slate-500">
                {new Date(intake.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Data */}
      {Object.keys(requestData).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-astralis-navy">
            <FileText className="w-5 h-5" />
            Request Data
          </h2>
          <div className="bg-slate-50 rounded-md border border-slate-100 p-4 overflow-x-auto">
            <pre className="text-sm text-slate-700 font-mono">
              {JSON.stringify(requestData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline">
          Reclassify
        </Button>
        <Button variant="outline">
          Reassign Pipeline
        </Button>
        {intake.status !== IntakeStatus.REJECTED && (
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Reject
          </Button>
        )}
      </div>
    </div>
  );
}
