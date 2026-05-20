import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export type SelectProps = {
  children?: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  name?: string
  required?: boolean
}

type SelectContextValue = {
  value?: string
  onValueChange: (value: string) => void
  open: boolean
  disabled?: boolean
  itemLabels: Readonly<Record<string, React.ReactNode>>
  registerItem: (value: string, label: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

const SelectContentModeContext = React.createContext<"menu" | "registry">("menu")

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error(`${component} must be used within Select`)
  }
  return context
}

const Select = ({
  value,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled,
  name,
  required,
  children,
}: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const [itemLabels, setItemLabels] = React.useState<Record<string, React.ReactNode>>({})

  const isValueControlled = value !== undefined
  const isOpenControlled = openProp !== undefined
  const currentValue = isValueControlled ? value : internalValue
  const currentOpen = isOpenControlled ? openProp : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isOpenControlled, onOpenChange],
  )

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isValueControlled) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
      handleOpenChange(false)
    },
    [handleOpenChange, isValueControlled, onValueChange],
  )

  const registerItem = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setItemLabels((prev) => {
      if (prev[itemValue] === label) return prev
      return { ...prev, [itemValue]: label }
    })
  }, [])

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open: currentOpen,
        disabled,
        itemLabels,
        registerItem,
      }}
    >
      <DropdownMenuPrimitive.Root
        open={currentOpen}
        onOpenChange={handleOpenChange}
        modal={false}
      >
        <div className="relative w-full min-w-0">
          {children}
        </div>
      </DropdownMenuPrimitive.Root>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={currentValue ?? ""}
          required={required}
        />
      ) : null}
    </SelectContext.Provider>
  )
}

const SelectGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("p-1", className)} {...props} />
)
SelectGroup.displayName = "SelectGroup"

const SelectValue = ({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) => {
  const { value, itemLabels } = useSelectContext("SelectValue")
  const hasValue = value !== undefined && value !== ""
  const label = hasValue ? itemLabels[value] ?? value : undefined

  return (
    <span
      className={cn("block w-full truncate", !label && "text-muted-foreground", className)}
      data-placeholder={label ? undefined : ""}
    >
      {label ?? placeholder}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children, disabled, ...props }, ref) => {
  const { disabled: selectDisabled, open } = useSelectContext("SelectTrigger")

  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      disabled={disabled ?? selectDisabled}
      className={cn(
        "flex h-9 w-full min-w-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-slate-200 dark:border-white/[0.08] bg-stone-50/80 dark:bg-white/[0.03] px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-amber-600/40 focus:border-amber-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-white/[0.03] dark:focus:border-transparent",
        className
      )}
      role="combobox"
      aria-expanded={open}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center overflow-hidden text-left">
        {children}
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </DropdownMenuPrimitive.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  />
))
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  />
))
SelectScrollDownButton.displayName = "SelectScrollDownButton"

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    position?: "popper" | "item-aligned"
  }
>(({ className, children, position: _position = "popper", sideOffset = 4, align = "start", side = "bottom", ...props }, ref) => {
  const { open } = useSelectContext("SelectContent")

  return (
    <>
      <SelectContentModeContext.Provider value="registry">
        <div aria-hidden className="hidden">
          {children}
        </div>
      </SelectContentModeContext.Provider>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          side={side}
          align={align}
          sideOffset={sideOffset}
          forceMount
          hidden={!open}
          className={cn(
            "select-dropdown-content relative z-[60] max-h-96 w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)] overflow-y-auto overflow-x-hidden rounded-lg border border-amber-200/60 dark:border-white/10 bg-[hsl(var(--popover))] p-1 text-popover-foreground shadow-xl shadow-amber-900/5",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        >
          <SelectContentModeContext.Provider value="menu">
            {children}
          </SelectContentModeContext.Provider>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </>
  )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    value: string
  }
>(({ className, children, value, disabled, ...props }, ref) => {
  const mode = React.useContext(SelectContentModeContext)
  const { value: selectedValue, onValueChange, registerItem } = useSelectContext("SelectItem")

  React.useLayoutEffect(() => {
    if (value === "") return
    registerItem(value, children)
  }, [children, registerItem, value])

  if (value === "") return null

  if (mode === "registry") {
    return null
  }

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors focus:bg-amber-600 focus:text-white data-[highlighted]:bg-amber-600 data-[highlighted]:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onSelect={() => {
        if (!disabled) {
          registerItem(value, children)
          onValueChange(value)
        }
      }}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </DropdownMenuPrimitive.Item>
  )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
