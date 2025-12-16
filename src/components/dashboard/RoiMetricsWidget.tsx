
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, DollarSign, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardData } from '@/types/dashboard';

interface RoiMetricsWidgetProps {
    metrics: DashboardData['roiMetrics'];
    className?: string;
}

export function RoiMetricsWidget({ metrics, className }: RoiMetricsWidgetProps) {
    if (!metrics) return null;

    return (
        <Card className={cn("shadow-card-glass border-slate-200/60 backdrop-blur-sm", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-indigo-50 rounded-lg border border-indigo-500/20">
                        <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    Performance & ROI
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Automation Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.automationRate}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            of tasks handled by AI
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Time Saved</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.timeSavedHours}h
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            est. manual hours saved
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-amber-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Est. Cost</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            ${metrics.estimatedCost}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            in token usage
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Error Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.errorRate}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            decision failure rate
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
