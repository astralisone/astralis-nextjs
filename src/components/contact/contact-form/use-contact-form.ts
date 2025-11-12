"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api"
import { contactFormSchema, type ContactFormData } from "./types"

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      company: "",
      phone: "",
    },
  })

  async function onSubmit(values: ContactFormData) {
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await api.post('/contact/submit', values)

      if (response.status === 201) {
        // Show success toast
        toast({
          title: "Message sent successfully!",
          description: "Thank you for contacting us. We'll get back to you as soon as possible.",
        })

        // Show success dialog
        setShowSuccessDialog(true)

        // Reset form
        form.reset()
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error)

      // Determine error message
      let errorMsg = "Failed to send message. Please try again."
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.message) {
        errorMsg = error.message
      }

      setErrorMessage(errorMsg)

      // Show error toast
      toast({
        title: "Failed to send message",
        description: errorMsg,
        variant: "destructive",
      })

      // Show error dialog
      setShowErrorDialog(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    showSuccessDialog,
    showErrorDialog,
    errorMessage,
    setShowSuccessDialog,
    setShowErrorDialog,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
