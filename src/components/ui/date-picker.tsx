import React from 'react';
import { Input } from './input';
import { Label } from './label';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({ label, value, onChange, className, disabled, placeholder }: DatePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <Input
        type="date"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
} 