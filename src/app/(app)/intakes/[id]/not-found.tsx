import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function IntakeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="w-16 h-16 mb-6 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-astralis-navy mb-2">
        Intake Not Found
      </h2>
      <p className="text-slate-600 mb-6 text-center max-w-md">
        The intake request you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Link href="/pipelines">
        <Button>Back to Pipelines</Button>
      </Link>
    </div>
  );
}
