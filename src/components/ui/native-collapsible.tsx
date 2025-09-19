import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return context;
};

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open = false, onOpenChange, children, className, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open);
    
    const isControlled = onOpenChange !== undefined;
    const actualOpen = isControlled ? open : internalOpen;
    
    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (isControlled) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    }, [isControlled, onOpenChange]);
    
    React.useEffect(() => {
      if (!isControlled) {
        setInternalOpen(open);
      }
    }, [open, isControlled]);

    return (
      <CollapsibleContext.Provider value={{ open: actualOpen, onOpenChange: handleOpenChange }}>
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ asChild = false, onClick, children, ...props }, ref) => {
    const { open, onOpenChange } = useCollapsible();
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open);
      onClick?.(event);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        'aria-expanded': open,
        'data-state': open ? 'open' : 'closed',
      } as any);
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useCollapsible();
    const [isAnimating, setIsAnimating] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const element = contentRef.current;
      if (!element) return;

      if (open) {
        setIsAnimating(true);
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
          element.style.height = `${element.scrollHeight}px`;
          element.style.transition = 'height 0.2s ease-out';
        });

        const handleTransitionEnd = () => {
          element.style.height = 'auto';
          element.style.overflow = 'visible';
          setIsAnimating(false);
        };

        element.addEventListener('transitionend', handleTransitionEnd, { once: true });
        
        return () => {
          element.removeEventListener('transitionend', handleTransitionEnd);
        };
      } else {
        setIsAnimating(true);
        element.style.height = `${element.scrollHeight}px`;
        element.style.overflow = 'hidden';
        element.style.transition = 'height 0.2s ease-out';
        
        requestAnimationFrame(() => {
          element.style.height = '0px';
        });

        const handleTransitionEnd = () => {
          setIsAnimating(false);
        };

        element.addEventListener('transitionend', handleTransitionEnd, { once: true });
        
        return () => {
          element.removeEventListener('transitionend', handleTransitionEnd);
        };
      }
    }, [open]);

    if (!open && !isAnimating) {
      return null;
    }

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(className)}
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };