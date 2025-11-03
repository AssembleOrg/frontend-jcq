import * as React from 'react';
import { cn } from '@/src/presentation/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-[var(--brand-orange)] border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  );
};

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
      <Loader size="lg" />
      <p className="mt-4 text-[var(--muted-foreground)]">{message}</p>
    </div>
  );
};

export { Loader, LoadingScreen };

