"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

type SwitchVariant = "default" | "green" | "rose"

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  variant?: SwitchVariant
  size?: "default" | "large"
}

const variantClasses: Record<SwitchVariant, string> = {
  default:
    "data-[state=unchecked]:bg-muted data-[state=unchecked]:dark:bg-white/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary",
  green:
    "data-[state=unchecked]:bg-muted data-[state=unchecked]:dark:bg-white/10 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600",
  rose:
    "data-[state=unchecked]:bg-muted data-[state=unchecked]:dark:bg-white/10 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600",
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      size === "default" && "h-5 w-9",
      size === "large" && "h-7 w-14",
      variantClasses[variant],
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full bg-white dark:bg-white shadow-md border border-border dark:border-white/20 transition-transform data-[state=unchecked]:translate-x-0",
        size === "default" && "h-4 w-4 data-[state=checked]:translate-x-4",
        size === "large" && "h-6 w-6 data-[state=checked]:translate-x-7"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
