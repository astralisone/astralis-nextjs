
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { RecentDocument } from '@/types/dashboard';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecentDocumentsProps {
    documents: RecentDocument[];
    className?: string;
    style?: React.CSSProperties;
}

export function RecentDocuments({ documents = [], className, style }: RecentDocumentsProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'PROCESSING':
                return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'FAILED':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'PROCESSING':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'FAILED':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <Card className={cn("shadow-card-glass border-slate-200/60 backdrop-blur-sm", className)} style={style}>
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-astralis-navy flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-astralis-blue/10 to-blue-50 rounded-lg border border-astralis-blue/20">
                            <FileText className="w-5 h-5 text-astralis-blue" />
                        </div>
                        Recent Documents
                    </div>
                    <Link
                        href="/documents"
                        className="text-sm font-medium text-astralis-blue hover:text-astralis-blue/80 transition-colors"
                    >
                        View All
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-1">
                    {documents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No documents processed yet.</p>
                        </div>
                    ) : (
                        documents.map((doc, index) => (
                            <div
                                key={doc.id}
                                className={cn(
                                    "group grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-astralis-blue/20 hover:shadow-sm",
                                    index % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                                )}
                            >
                                {/* Column 1: Identity & Icon */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 font-bold text-[10px] tracking-tighter border shadow-sm", getStatusColor(doc.status))}>
                                        {doc.type.split('/')[1]?.toUpperCase() || 'DOC'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-astralis-blue transition-colors">
                                            {doc.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">
                                            ID: {doc.id.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>

                                {/* Column 2: Meta Info (Size, Date) */}
                                <div className="flex flex-col md:items-center text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-600">{(doc.size / 1024).toFixed(1)} KB</span>
                                        <span className="text-slate-300">•</span>
                                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] opacity-70 mt-0.5">Uploaded via Web</p>
                                </div>

                                {/* Column 3: Status Badge */}
                                <div className="flex items-center justify-end">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm transition-all duration-300 group-hover:scale-105",
                                        getStatusColor(doc.status)
                                    )}>
                                        {getStatusIcon(doc.status)}
                                        {doc.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
