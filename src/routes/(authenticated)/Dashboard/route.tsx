import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/(authenticated)/Dashboard")({
  component: () => (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div
          id="content"
          className={cn(
            "max-w-full w-full ml-auto",
            "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]",
            "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
            "transition-[width] ease-linear duration-200",
            "h-svh flex flex-col"
          )}
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
});
