import * as React from 'react';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-foreground text-background hover:opacity-90',
  ghost: 'hover:bg-muted',
  outline: 'border hover:bg-muted',
};
const sizes = { default: 'h-10 px-4 text-sm', sm: 'h-8 px-3 text-xs', lg: 'h-12 px-6 text-base' };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button ref={ref}
      className={twMerge('inline-flex items-center justify-center rounded-md font-medium transition disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props} />
  )
);
Button.displayName = 'Button';
