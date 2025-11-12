"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"

interface FormSubmitProps {
  isSubmitting: boolean
}

export function FormSubmit({ isSubmitting }: FormSubmitProps) {
  return (
    <Button
      type="submit"
      className="w-full h-10"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Message
        </>
      )}
    </Button>
  )
}
