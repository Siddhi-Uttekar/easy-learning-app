import { IconMail, type Icon } from "@tabler/icons-react";
import { forwardRef } from "react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  isActive?: boolean;
  badge?: string | number;
}

interface NavMainProps {
  items: NavItem[];
  className?: string;
  title?: string;
}

export const NavMain = forwardRef<HTMLDivElement, NavMainProps>(
  ({ items, className, title }, ref) => {
    const handleInboxClick = () => {
      // Add your inbox logic here
      console.log("Inbox clicked");
    };

    return (
      <SidebarGroup ref={ref} className={cn("space-y-4", className)}>
        <SidebarGroupContent className="flex flex-col gap-3">
          {/* Inbox Action */}
          <SidebarGroupLabel>{title}</SidebarGroupLabel>

          {/* Navigation Items Section */}
          {items.length > 0 && (
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={item.isActive}
                    className={cn(
                      "w-full justify-start",
                      "transition-all duration-200 ease-in-out",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      item.isActive &&
                        "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <a
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && (
                          <item.icon
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "ml-auto px-1.5 py-0.5 text-xs font-medium rounded-full",
                            "bg-primary/10 text-primary",
                            "group-data-[collapsible=icon]:hidden"
                          )}
                          aria-label={`${item.badge} items`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }
);

NavMain.displayName = "NavMain";
