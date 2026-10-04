import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref}
      className={twMerge('h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20', className)}
      {...props} />
  )
);
Input.displayName = 'Input';
