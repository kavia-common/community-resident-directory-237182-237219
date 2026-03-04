import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// PUBLIC_INTERFACE
/**
 * Retro-styled input component
 * @param label - Optional label for the input
 * @param error - Error message to display
 */
export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
          {label}
        </label>
      )}
      <input className={`retro-input ${error ? 'border-[var(--color-error)]' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-[var(--color-error)] font-bold">{error}</p>}
    </div>
  );
}
