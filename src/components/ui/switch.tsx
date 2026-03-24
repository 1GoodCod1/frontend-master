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
    "data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-emerald-500",
  green:
    "data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-emerald-500",
  rose:
    "data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-rose-500",
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
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
        "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform data-[state=unchecked]:translate-x-0",
        size === "default" && "h-4 w-4 data-[state=checked]:translate-x-4",
        size === "large" && "h-6 w-6 data-[state=checked]:translate-x-7"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
