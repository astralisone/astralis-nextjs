"use client"

import { ContactForm } from "@/components/contact/contact-form"

export function ContactPageClient() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have a project in mind? We'd love to hear about it. Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>
      <ContactForm />
    </div>
  )
}
