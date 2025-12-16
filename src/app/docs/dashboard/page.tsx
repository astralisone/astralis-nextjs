
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, GitBranch, FileText, CheckCircle, TrendingUp } from 'lucide-react';

export default function DashboardDocsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-bold text-astralis-navy mb-4">Dashboard Overview</h1>
                <p className="text-lg text-slate-600">
                    The Astralis Command Center provides a real-time overview of your operations, enabling you to track intake requests, document processing, and automated workflows at a glance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-card-glass border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-astralis-blue" />
                            Intake Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">
                            Track all incoming requests from email, forms, and API integrations. The dashboard shows volume trends and pending items requiring attention.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li>Volume trends over time</li>
                            <li>Source breakdown (Email vs Web)</li>
                            <li>Pending vs Assigned status</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="shadow-card-glass border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-2">
                            <FileText className="w-5 h-5 text-astralis-blue" />
                            Document Processing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">
                            Monitor the status of AI-driven document analysis. See which files are currently processing, completed, or flagged for review.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li>Recent uploads list</li>
                            <li>Processing success rates</li>
                            <li>Extracted data verification</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="shadow-card-glass border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-astralis-blue" />
                            Active Pipelines
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">
                            Visual overview of your operational pipelines. Track how many items are moving through each stage of your workflows.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li>Stage distribution</li>
                            <li>Bottleneck identification</li>
                            <li>Throughput metrics</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="shadow-card-glass border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-astralis-blue" />
                            Activity Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">
                            A chronological log of all system actions, including AI decisions, user updates, and automated trigger executions.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                            <li>AI decision log</li>
                            <li>User audit trail</li>
                            <li>System alerts & notifications</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h2 className="text-xl font-bold text-astralis-navy mb-4">Key Metrics Explained</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Total Intake</h3>
                        <p className="text-sm text-slate-600">The aggregate number of new requests received across all channels.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Active Pipelines</h3>
                        <p className="text-sm text-slate-600">Workflows that currently have at least one active item in progress.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Tasks Completed</h3>
                        <p className="text-sm text-slate-600">The total count of individual work items moved to a "Done" state within pipelines.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Automation Rate</h3>
                        <p className="text-sm text-slate-600">The percentage of tasks that were processed purely by AI agents without human intervention.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Estimated Cost</h3>
                        <p className="text-sm text-slate-600">Approximate cost of LLM token usage for all AI decisions made in the selected period.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
