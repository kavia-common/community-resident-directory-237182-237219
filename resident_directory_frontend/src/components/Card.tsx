import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// PUBLIC_INTERFACE
/**
 * Retro-styled card component
 * @param children - Card content
 * @param className - Additional CSS classes
 * @param title - Optional card title
 */
export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`retro-card ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 uppercase">{title}</h3>}
      {children}
    </div>
  );
}
