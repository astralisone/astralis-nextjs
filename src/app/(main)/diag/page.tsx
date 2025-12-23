'use client';

export default function DiagPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Diagnostic Page</h1>
            <p className="mt-4 text-slate-600">
                If you can see this page, the <code>(main)</code> route group is resolving new routes correctly.
            </p>
            <div className="mt-8 p-4 bg-slate-100 rounded-lg">
                <p className="font-mono text-sm">Path: src/app/(main)/diag/page.tsx</p>
            </div>
        </div>
    );
}
