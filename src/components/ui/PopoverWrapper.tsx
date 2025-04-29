
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const PopoverRoot = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

// Custom PopoverContent with better control over closing behavior
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { 
    preventAutoClose?: boolean 
  }
>(({ className, align = "center", sideOffset = 4, preventAutoClose = false, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Use effect to prevent unwanted closes when preventAutoClose is true
  React.useEffect(() => {
    if (preventAutoClose) {
      const handleClickOutside = (e: MouseEvent) => {
        // Only prevent default if the click target is not explicitly meant to close the popover
        if (contentRef.current && 
            !contentRef.current.contains(e.target as Node) && 
            !(e.target as HTMLElement)?.closest('[data-close-popover="true"]')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      // Use capture phase to intercept events early
      document.addEventListener('click', handleClickOutside, { capture: true });
      
      return () => {
        document.removeEventListener('click', handleClickOutside, { capture: true });
      };
    }
  }, [preventAutoClose]);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={(node) => {
          // Handle both the forwarded ref and our internal ref
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          contentRef.current = node;
        }}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[200] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent };
