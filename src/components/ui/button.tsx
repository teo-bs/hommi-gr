import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-button font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation active:scale-95",
  {
    variants: {
      variant: {
        // Core variants (use these for consistency)
        // Primary - main CTAs, high emphasis
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-shadow",
        
        // Secondary - secondary actions
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm hover:shadow-md transition-shadow",
        
        // Outline - low emphasis, borders
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent shadow-sm hover:shadow-md transition-shadow",
        
        // Ghost - tertiary actions, minimal styling
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-sm transition-shadow",
        
        // Utility variants
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg transition-shadow",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Special variants
        hero: "bg-gradient-hero text-primary-foreground hover:shadow-primary transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl",
        premium: "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02] transition-all duration-300",
      },
      size: {
        sm: "h-10 rounded-lg px-3 text-small min-h-[40px]",
        default: "h-11 px-6 py-2 min-h-[44px]",
        lg: "h-12 rounded-lg px-8 text-base min-h-[48px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
