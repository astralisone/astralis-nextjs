"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  Send,
  Globe,
  ChevronDown,
  Star,
  Award,
  Shield,
  FileText,
  Flag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ]

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Process", href: "/process" },
    { name: "Workflow Demo", href: "/workflow-demo" },
    { name: "Blog", href: "/blog" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Contact", href: "/contact" },
  ]

  const services = [
    { name: "Customer Service Automation", href: "/services/customer-service" },
    { name: "Sales Pipeline Optimization", href: "/services/sales-pipeline" },
    { name: "Content Generation", href: "/services/content-generation" },
    { name: "Data Analytics", href: "/services/data-analytics" },
    { name: "Service Wizard", href: "/services/wizard" },
  ]

  const resources = [
    { name: "Documentation", href: "/docs", external: false },
    { name: "API Reference", href: "/api", external: false },
    { name: "Support Center", href: "/support", external: false },
    { name: "Knowledge Base", href: "/kb", external: false },
    { name: "Community", href: "/community", external: false },
    { name: "Status Page", href: "https://status.astralisagency.com", external: true },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR Compliance", href: "/gdpr" },
    { name: "Security", href: "/security" },
    { name: "Accessibility", href: "/accessibility" },
  ]

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/astralisagency", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/astralisagency", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/astralisagency", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/astralisagency", label: "YouTube" },
    { icon: Linkedin, href: "https://linkedin.com/company/astralisagency", label: "LinkedIn" },
  ]

  return (
    <footer className={cn(
      "relative border-t border-white/10 bg-gradient-to-br from-neutral-950/90 via-neutral-900/95 to-primary-950/90 backdrop-blur-xl",
      className
    )}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 via-transparent to-secondary-900/10 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Company info - Left column */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Logo and tagline */}
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400 bg-clip-text text-transparent">
                    Astralis Agency
                  </h3>
                  <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                    Transforming businesses through innovative digital solutions.
                    We craft exceptional user experiences and robust technical architectures
                    that drive growth and success.
                  </p>
                </div>

                {/* Contact information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Contact Info
                  </h4>
                  <div className="space-y-3">
                     <div className="flex items-center space-x-3 text-sm text-neutral-300">
                       <Flag className="h-4 w-4 text-primary-400 flex-shrink-0" />
                       <span>Made in the USA</span>
                     </div>
                     <div className="flex items-center space-x-3 text-sm text-neutral-300">
                       <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                       <a href="tel:341-223-4433" className="hover:text-primary-300 transition-colors">
                         341.223.4433
                       </a>
                     </div>
                     <div className="flex items-center space-x-3 text-sm text-neutral-300">
                       <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                       <a href="mailto:ceo@astralisone.com" className="hover:text-primary-300 transition-colors">
                         ceo@astralisone.com
                       </a>
                     </div>

                  </div>
                </div>

                {/* Certifications */}
                <div className="pt-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 text-xs text-neutral-400">
                      <Award className="h-4 w-4 text-secondary-400" />
                      <span>ISO 27001</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-neutral-400">
                      <Shield className="h-4 w-4 text-primary-400" />
                      <span>SOC 2 Type II</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-neutral-400">
                      <Star className="h-4 w-4 text-secondary-400" />
                      <span>GDPR Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-primary-300 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Services
              </h4>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-sm text-neutral-300 hover:text-primary-300 transition-colors duration-200"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:col-span-1">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Resources
              </h4>
              <ul className="space-y-3">
                {resources.map((resource) => (
                  <li key={resource.name}>
                    {resource.external ? (
                      <a
                        href={resource.href}
                        className="text-sm text-neutral-300 hover:text-primary-300 transition-colors duration-200 flex items-center space-x-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{resource.name}</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href={resource.href}
                        className="text-sm text-neutral-300 hover:text-primary-300 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <span>{resource.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-1">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-primary-300 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                    Follow Us
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => {
                      const IconComponent = social.icon
                      return (
                        <Button
                          key={social.label}
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:bg-primary-500/20 hover:border-primary-400/30 transition-all duration-200"
                          asChild
                        >
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                          >
                            <IconComponent className="h-4 w-4" />
                          </a>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Bottom section */}
        <div className="py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Copyright and legal */}
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <p className="text-xs text-neutral-400 text-center md:text-left">
                © {new Date().getFullYear()} Astralis Agency. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Made with ♥ in Silicon Valley</span>
                </div>
              </div>
            </div>

            {/* Language selector and back to top */}
            <div className="flex items-center gap-4">
              {/* Language/Region selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                >
                  <Globe className="h-3 w-3 mr-2" />
                  {languages.find(lang => lang.name === selectedLanguage)?.flag} {selectedLanguage}
                  <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", isLanguageDropdownOpen && "rotate-180")} />
                </Button>

                {isLanguageDropdownOpen && (
                  <div className="absolute bottom-full mb-2 right-0 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-glass min-w-[140px] py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.name)
                          setIsLanguageDropdownOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:text-white hover:bg-white/10 flex items-center space-x-2"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Back to top button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollToTop}
                className="h-8 w-8 rounded-full bg-primary-500/20 border border-primary-400/30 hover:bg-primary-500/30 hover:border-primary-400/50 transition-all duration-200"
                aria-label="Back to top"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
