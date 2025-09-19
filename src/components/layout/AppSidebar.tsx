import { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  LayoutDashboard, 
  Upload,
  Users,
  Settings
} from "lucide-react";
import trizenLogo from "@/assets/trizen-logo.png";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Problem Statements", url: "/problems", icon: FileText },
  { title: "Bulk Upload", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const adminItems = [
  { title: "Users", url: "/users", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-white font-semibold shadow-sm border-l-4 border-white" 
      : "text-gray-700 hover:bg-gray-50 hover:text-primary transition-all duration-200 border-l-4 border-transparent hover:border-primary/30";

  return (
    <Sidebar
      className="w-64 bg-white border-r border-gray-100 shadow-lg"
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-gray-100 bg-gradient-to-br from-primary-50 to-white">
        <div className="flex flex-col items-center justify-center p-8 space-y-3">
          {/* <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-md border border-gray-100"> */}
            <img src={trizenLogo} alt="Trizen Ventures" className="w-full h-full object-contain" />
          {/* </div> */}
          {/* <div className="text-center">
            <h1 className="text-sm font-bold text-primary-800">TRIZEN</h1>
            <p className="text-xs text-primary-600 font-medium tracking-wider">VENTURES</p>
          </div> */}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 rounded-md">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="text-black w-4 h-4" />
                      <span className="font-medium text-sm text-black">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 rounded-md">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="text-black w-4 h-4" />
                      <span className="font-medium text-sm text-black">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}