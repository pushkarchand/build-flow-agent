import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delayDuration?: number;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a Tooltip");
  }
  return context;
};

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const TooltipProvider = ({ children, delayDuration = 700 }: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

const Tooltip = ({ children, delayDuration = 700 }: TooltipProps) => {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const onOpenChange = React.useCallback((newOpen: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (newOpen) {
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
    } else {
      setOpen(false);
    }
  }, [delayDuration]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ open, onOpenChange, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const TooltipTrigger = ({ asChild = false, children }: TooltipTriggerProps) => {
  const { onOpenChange } = useTooltip();

  const handleMouseEnter = () => onOpenChange(true);
  const handleMouseLeave = () => onOpenChange(false);
  const handleFocus = () => onOpenChange(true);
  const handleBlur = () => onOpenChange(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    } as any);
  }

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </span>
  );
};

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  hidden?: boolean;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", align = "center", sideOffset = 4, hidden = false, children, ...props }, ref) => {
    const { open } = useTooltip();
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const triggerRef = React.useRef<Element | null>(null);

    React.useEffect(() => {
      const trigger = document.querySelector('[data-tooltip-trigger]');
      if (trigger) {
        triggerRef.current = trigger;
        const rect = trigger.getBoundingClientRect();
        const scrollX = window.pageXOffset;
        const scrollY = window.pageYOffset;

        let x = 0;
        let y = 0;

        // Calculate position based on side
        switch (side) {
          case "top":
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.top + scrollY - sideOffset;
            break;
          case "right":
            x = rect.right + scrollX + sideOffset;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case "bottom":
            x = rect.left + rect.width / 2 + scrollX;
            y = rect.bottom + scrollY + sideOffset;
            break;
          case "left":
            x = rect.left + scrollX - sideOffset;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }

        setPosition({ x, y });
      }
    }, [open, side, sideOffset]);

    if (!open || hidden) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md pointer-events-none",
          "animate-in fade-in-0 zoom-in-95",
          side === "top" && "slide-in-from-bottom-2",
          side === "right" && "slide-in-from-left-2", 
          side === "bottom" && "slide-in-from-top-2",
          side === "left" && "slide-in-from-right-2",
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: getTransform(side, align),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

function getTransform(side: string, align: string) {
  let transform = "";
  
  // Handle side positioning
  switch (side) {
    case "top":
      transform += "translateY(-100%)";
      break;
    case "right":
      transform += "translateX(0%)";
      break;
    case "bottom":
      transform += "translateY(0%)";
      break;
    case "left":
      transform += "translateX(-100%)";
      break;
  }
  
  // Handle alignment
  switch (align) {
    case "start":
      if (side === "top" || side === "bottom") {
        transform += " translateX(-25%)";
      } else {
        transform += " translateY(-25%)";
      }
      break;
    case "center":
      if (side === "top" || side === "bottom") {
        transform += " translateX(-50%)";
      } else {
        transform += " translateY(-50%)";
      }
      break;
    case "end":
      if (side === "top" || side === "bottom") {
        transform += " translateX(-75%)";
      } else {
        transform += " translateY(-75%)";
      }
      break;
  }
  
  return transform;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };