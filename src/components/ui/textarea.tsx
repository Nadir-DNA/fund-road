
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onSelect, onFocus, onClick, ...props }, ref) => {
    // Create a stable ref for the textarea element
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Combine refs to handle both the forwarded ref and our local ref
    const handleRef = React.useCallback((element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }, [ref]);
    
    // Custom handlers to prevent unwanted selection
    const handleSelect = React.useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (onSelect) onSelect(e as React.SyntheticEvent<HTMLTextAreaElement, Event>);
    }, [onSelect]);
    
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Prevent automatic selection on focus
      const target = e.target;
      const len = target.value.length;
      
      // Only set cursor position if text is selected
      if (target.selectionStart === 0 && target.selectionEnd === len && len > 0) {
        requestAnimationFrame(() => {
          target.setSelectionRange(len, len);
        });
      }
      
      if (onFocus) onFocus(e);
    }, [onFocus]);
    
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (onClick) onClick(e);
    }, [onClick]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={handleRef}
        onSelect={handleSelect}
        onFocus={handleFocus}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
