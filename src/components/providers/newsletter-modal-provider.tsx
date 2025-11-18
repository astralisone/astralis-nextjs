'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { NewsletterModal } from '@/components/newsletter/NewsletterModal';

interface NewsletterModalContextType {
  openNewsletterModal: () => void;
  closeNewsletterModal: () => void;
  isOpen: boolean;
}

const NewsletterModalContext = createContext<NewsletterModalContextType | undefined>(undefined);

export function NewsletterModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNewsletterModal = () => setIsOpen(true);
  const closeNewsletterModal = () => setIsOpen(false);

  return (
    <NewsletterModalContext.Provider
      value={{
        openNewsletterModal,
        closeNewsletterModal,
        isOpen,
      }}
    >
      {children}
      <NewsletterModal open={isOpen} onOpenChange={setIsOpen} />
    </NewsletterModalContext.Provider>
  );
}

export function useNewsletterModal() {
  const context = useContext(NewsletterModalContext);
  if (context === undefined) {
    throw new Error('useNewsletterModal must be used within a NewsletterModalProvider');
  }
  return context;
}
