import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBook,
  IconClipboard,
  IconPlus,
  IconFileText,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authService } from "@/service/authService";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/Dashboard",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navCourses: [
    {
      title: "Courses",
      url: "/Dashboard/courses",
      icon: IconBook,
      isActive: false,
      items: [
        {
          title: "All Courses",
          url: "/courses",
        },
        {
          title: "My Courses",
          url: "/courses/my-courses",
        },
      ],
    },
    {
      title: "Create Course",
      url: "Dashboard/create-course",
      icon: IconPlus,
      items: [
        {
          title: "New Course",
          url: "/create-course",
        },
        {
          title: "Course Templates",
          url: "/create-course/templates",
        },
      ],
    },
  ],
  navTests: [
    {
      title: "Tests",
      url: "/tests",
      icon: IconClipboard,
      isActive: false,
      items: [
        {
          title: "All Tests",
          url: "/tests",
        },
        {
          title: "My Tests",
          url: "/tests/my-tests",
        },
      ],
    },
    {
      title: "Create Test",
      url: "Dashboard/tests/create",
      icon: IconFileText,
      items: [
        {
          title: "New Test",
          url: "/tests/create",
        },
        {
          title: "Test Templates",
          url: "/tests/create/templates",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = authService.user;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Easy Learning</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title={data.navMain[0].title} />
        <NavMain items={data.navCourses} title={data.navCourses[0].title} />
        <NavMain items={data.navTests} title={data.navTests[0].title} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
