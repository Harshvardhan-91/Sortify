import React from 'react';
import { cn } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'ui:inline-flex ui:items-center ui:justify-center ui:whitespace-nowrap ui:rounded-md ui:text-sm ui:font-medium ui:ring-offset-white ui:transition-colors focus-visible:ui:outline-none focus-visible:ui:ring-2 focus-visible:ui:ring-neutral-950 focus-visible:ui:ring-offset-2 disabled:ui:pointer-events-none disabled:ui:opacity-50',
          {
            'ui:bg-neutral-900 ui:text-neutral-50 hover:ui:bg-neutral-900/90':
              variant === 'default',
            'ui:bg-red-500 ui:text-neutral-50 hover:ui:bg-red-500/90':
              variant === 'destructive',
            'ui:border ui:border-neutral-200 ui:bg-white hover:ui:bg-neutral-100 hover:ui:text-neutral-900':
              variant === 'outline',
            'ui:bg-neutral-100 ui:text-neutral-900 hover:ui:bg-neutral-100/80':
              variant === 'secondary',
            'hover:ui:bg-neutral-100 hover:ui:text-neutral-900':
              variant === 'ghost',
            'ui:text-neutral-900 ui:underline-offset-4 hover:ui:underline':
              variant === 'link',
          },
          {
            'ui:h-10 ui:px-4 ui:py-2': size === 'default',
            'ui:h-9 ui:rounded-md ui:px-3': size === 'sm',
            'ui:h-11 ui:rounded-md ui:px-8': size === 'lg',
            'ui:h-10 ui:w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
