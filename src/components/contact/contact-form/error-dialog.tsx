"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errorMessage: string
  onRetry?: () => void
}

export function ErrorDialog({ open, onOpenChange, errorMessage, onRetry }: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-red-900">
            Failed to Send Message
          </DialogTitle>
          <DialogDescription className="text-center">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-center">
          {onRetry && (
            <Button
              onClick={() => {
                onOpenChange(false)
                onRetry()
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
