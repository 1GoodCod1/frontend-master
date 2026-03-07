import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--button-bg))] text-white hover:bg-[hsl(var(--button-bg-hover))] dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90 cursor-pointer",
        outline:
          "border-2 border-[hsl(var(--button-bg))] bg-transparent text-[hsl(var(--button-bg))] hover:bg-[hsl(var(--button-bg))] hover:text-white dark:border-amber-500/50 dark:bg-transparent dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 dark:hover:border-amber-500/50 cursor-pointer",
        secondary:
          "bg-[hsl(var(--button-bg))]/10 text-[hsl(var(--button-bg))] hover:bg-[hsl(var(--button-bg))]/20 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground cursor-pointer",
        link: "text-cta underline-offset-4 hover:underline dark:text-cta dark:hover:text-cta/90 cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs [&_svg]:size-3.5",
        lg: "h-10 rounded-md px-8 [&_svg]:size-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
