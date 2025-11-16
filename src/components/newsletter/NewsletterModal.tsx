'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewsletterSubscription } from './NewsletterSubscription';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsletterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsletterModal({ open, onOpenChange }: NewsletterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20 border-white/10 p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Stay Ahead of the Curve
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-400 mt-2">
            Get exclusive insights on AI, automation, and digital transformation delivered to your inbox.
          </p>
        </DialogHeader>
        <div className="px-6 pb-6">
          <NewsletterSubscription
            variant="modal"
            source="modal"
            showPreferences={true}
            buttonText="Subscribe Now"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
