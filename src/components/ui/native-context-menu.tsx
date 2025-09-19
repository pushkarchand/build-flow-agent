import * as React from "react";
import { cn } from "@/lib/utils";

interface ContextMenuContextValue {
  isOpen: boolean;
  position: { x: number; y: number };
  onOpenChange: (open: boolean) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | undefined>(undefined);

const useContextMenu = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenu");
  }
  return context;
};

interface ContextMenuProps {
  children: React.ReactNode;
}

const ContextMenu = ({ children }: ContextMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const onOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => setIsOpen(false);
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <ContextMenuContext.Provider value={{ isOpen, position, onOpenChange }}>
      <div onContextMenu={(e) => {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
      }}>
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
};

interface ContextMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const ContextMenuTrigger = ({ asChild = false, children }: ContextMenuTriggerProps) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }
  return <>{children}</>;
};

interface ContextMenuContentProps {
  className?: string;
  children: React.ReactNode;
}

const ContextMenuContent = ({ className, children }: ContextMenuContentProps) => {
  const { isOpen, position } = useContextMenu();
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menu;
      
      let { x, y } = position;
      
      // Adjust position if menu would go off screen
      if (x + offsetWidth > innerWidth) {
        x = innerWidth - offsetWidth - 10;
      }
      if (y + offsetHeight > innerHeight) {
        y = innerHeight - offsetHeight - 10;
      }
      
      menu.style.left = `${Math.max(0, x)}px`;
      menu.style.top = `${Math.max(0, y)}px`;
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

interface ContextMenuItemProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const ContextMenuItem = ({ className, onClick, children }: ContextMenuItemProps) => {
  const { onOpenChange } = useContextMenu();
  
  const handleClick = () => {
    onClick?.();
    onOpenChange(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

const ContextMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
);

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
};