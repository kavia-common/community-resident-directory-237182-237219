import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

// PUBLIC_INTERFACE
/**
 * Retro-styled button component
 * @param variant - The button style variant (primary, secondary, outline)
 * @param children - Button content
 */
export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const variantClasses = {
    primary: 'retro-button',
    secondary: 'retro-button retro-button-secondary',
    outline: 'retro-button retro-button-outline',
  };

  return (
    <button className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
