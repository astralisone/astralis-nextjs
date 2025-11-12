"use client"

import { motion } from "framer-motion"
import { Form } from "@/components/ui/form"
import { FormFields } from "./form-fields"
import { FormSubmit } from "./form-submit"
import { SuccessDialog } from "./success-dialog"
import { ErrorDialog } from "./error-dialog"
import { useContactForm } from "./use-contact-form"

export function ContactForm() {
  const {
    form,
    isSubmitting,
    showSuccessDialog,
    showErrorDialog,
    errorMessage,
    setShowSuccessDialog,
    setShowErrorDialog,
    onSubmit
  } = useContactForm()

  const handleRetry = () => {
    // Trigger form submission again with current values
    onSubmit()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormFields form={form} />
              <div className="pt-2">
                <FormSubmit isSubmitting={isSubmitting} />
              </div>
            </form>
          </Form>
        </div>
      </motion.div>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />

      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onRetry={handleRetry}
      />
    </>
  )
}
