import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-astralis-blue/10 text-astralis-blue',
  secondary: 'bg-slate-200 text-slate-800',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-orange-100 text-orange-700 border border-orange-200',
  error: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export function Badge({ children, className, variant = 'default', title }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
      title={title}
    >
      {children}
    </span>
  );
}
