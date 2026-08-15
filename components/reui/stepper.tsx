"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type StepState = "active" | "completed" | "inactive"

const StepperContext = React.createContext<{
  value: number
  onValueChange?: (step: number) => void
}>({ value: 1 })

const StepperItemContext = React.createContext<{ state: StepState }>({
  state: "inactive",
})

function useStepper() {
  return React.useContext(StepperContext)
}

function useStepperItem() {
  return React.useContext(StepperItemContext)
}

function getStepState(currentStep: number, step: number): StepState {
  if (step < currentStep) return "completed"
  if (step === currentStep) return "active"
  return "inactive"
}

function Stepper({
  value,
  onValueChange,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: number
  onValueChange?: (step: number) => void
}) {
  return (
    <StepperContext.Provider value={{ value, onValueChange }}>
      <div
        data-slot="stepper"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  )
}

function StepperNav({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-nav"
      className={cn("flex w-full items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function StepperItem({
  step,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { step: number }) {
  const { value } = useStepper()
  const state = getStepState(value, step)

  return (
    <StepperItemContext.Provider value={{ state }}>
      <div
        data-slot="stepper-item"
        data-state={state}
        className={cn("group/step flex items-center", className)}
        {...props}
      >
        {children}
      </div>
    </StepperItemContext.Provider>
  )
}

function StepperTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { onValueChange } = useStepper()
  const { state } = useStepperItem()

  return (
    <div
      data-slot="stepper-trigger"
      role="button"
      tabIndex={onValueChange ? 0 : -1}
      onClick={() => onValueChange?.(0)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onValueChange?.(0)
        }
      }}
      className={cn(" shrink-0 cursor-default", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function StepperIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useStepperItem()

  return (
    <div
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
        state === "active" &&
          "border-primary bg-primary/10 text-primary",
        state === "completed" &&
          "border-primary bg-primary text-primary-foreground",
        state === "inactive" &&
          "border-muted-foreground/30 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function StepperSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useStepperItem()

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        "mx-2 h-0.5 w-12 transition-colors",
        state === "completed" ? "bg-primary" : "bg-border",
        className
      )}
      {...props}
    />
  )
}

function StepperPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const { value } = useStepper()

  return (
    <div data-slot="stepper-panel" className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement<{ value?: number }>(child) &&
          child.props.value === value
        ) {
          return child
        }
        return null
      })}
    </div>
  )
}

function StepperContent({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: number }) {
  return (
    <div
      data-slot="stepper-content"
      data-value={value}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperPanel,
  StepperContent,
}
