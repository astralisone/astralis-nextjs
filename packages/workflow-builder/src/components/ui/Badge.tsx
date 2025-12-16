import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-slate-300 text-slate-700',
    secondary: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}