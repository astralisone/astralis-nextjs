import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: number) => string;
  delay?: number;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  className,
  prefix = '',
  suffix = '',
  formatValue,
  delay = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Wait for delay before starting
    const delayTimer = setTimeout(() => {
      setIsAnimating(true);
      
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        setDisplayValue(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [value, duration, delay]);

  const formattedValue = formatValue 
    ? formatValue(displayValue) 
    : displayValue.toLocaleString();

  return (
    <span 
      className={cn(
        "tabular-nums font-bold transition-all",
        isAnimating && "animate-counter",
        className
      )}
    >
      {prefix}
      <span className="value-number">{formattedValue}</span>
      {suffix}
    </span>
  );
}