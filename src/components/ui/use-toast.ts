
// Simple toast context without circular dependencies
import * as React from "react"

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: "default" | "destructive" | "success"
  duration?: number
}

type ToasterToast = ToastProps

const TOAST_LIMIT = 10
const TOAST_REMOVE_DELAY = 1000

type ToasterToastState = {
  toasts: ToasterToast[]
}

// Create the context with type safety
export const ToastContext = React.createContext<{
  toast: (props: Omit<ToasterToast, "id">) => void
  dismiss: (toastId: string) => void
}>({
  toast: () => {}, // Default no-op function
  dismiss: () => {}, // Default no-op function
})

// Hook to use toast context
export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
}

// Export type for action elements
export type ToastActionType = React.ComponentPropsWithoutRef<"button">

// Standalone implementation for use outside context (will be replaced by context in runtime)
export const toast = (props: Omit<ToasterToast, "id">) => {
  const context = React.useContext(ToastContext)
  if (context) {
    return context.toast(props)
  } else {
    console.warn("Toast called outside of ToastProvider context")
  }
}
