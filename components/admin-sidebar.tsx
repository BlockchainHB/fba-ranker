import * as React from "react"
import Link from "next/link"
import {
  Settings,
  Trophy,
  Upload,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Home,
  Shield,
  MoreHorizontal,
  LogOut,
  RefreshCw
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Admin navigation data with proper types
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<any>
  badge?: string
}

interface NavSection {
  title: string
  url: string
  icon: React.ComponentType<any>
  items: NavItem[]
}

const adminNavData: { navMain: NavSection[] } = {
  navMain: [
    {
      title: "Main Site",
      url: "/",
      icon: Home,
      items: [
        {
          title: "Leaderboard",
          url: "/",
          icon: Trophy,
        },
        {
          title: "Submit Proof",
          url: "/submit",
          icon: Upload,
        },
        {
          title: "Profile",
          url: "/signup",
          icon: User,
        },
      ],
    },
    {
      title: "Admin Panel",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Pending",
          url: "/admin",
          icon: Clock,
          badge: "pending",
        },
        {
          title: "Approved", 
          url: "/admin",
          icon: CheckCircle,
          badge: "approved",
        },
        {
          title: "Rejected",
          url: "/admin", 
          icon: XCircle,
          badge: "rejected",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Manage Users",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "Admin Roles",
          url: "/admin/roles",
          icon: Shield,
        },
      ],
    },
  ],
}

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab?: string
  pendingCount?: number
  approvedCount?: number
  rejectedCount?: number
  onTabChange?: (tab: string) => void
  userName?: string
  userEmail?: string
  userAvatar?: string
  onSignOut?: () => void
  onRefresh?: () => void
}

export function AdminSidebar({ 
  activeTab, 
  pendingCount = 0,
  approvedCount = 0, 
  rejectedCount = 0,
  onTabChange,
  userName = "Admin User",
  userEmail,
  userAvatar,
  onSignOut,
  onRefresh,
  ...props 
}: AdminSidebarProps) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Trophy className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                                      <span className="font-medium">FBA Hangout</span>
                  <span className="text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {onRefresh && (
            <SidebarMenuItem>
              <button 
                onClick={onRefresh}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <RefreshCw className="size-3" />
                Refresh Data
              </button>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {adminNavData.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((subItem) => {
                      const isActive = subItem.badge === activeTab
                      let badgeCount = 0
                      
                      // Set badge counts based on type
                      if (subItem.badge === "pending") badgeCount = pendingCount
                      else if (subItem.badge === "approved") badgeCount = approvedCount  
                      else if (subItem.badge === "rejected") badgeCount = rejectedCount

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.badge ? (
                            // Admin panel items with click handlers
                            <SidebarMenuSubButton 
                              isActive={isActive}
                              onClick={() => {
                                if (onTabChange && subItem.badge) {
                                  onTabChange(subItem.badge)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <subItem.icon className="size-3" />
                                  {subItem.title}
                                </div>
                                {badgeCount > 0 && (
                                  <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
                                    {badgeCount}
                                  </span>
                                )}
                              </div>
                            </SidebarMenuSubButton>
                          ) : (
                            // Main site navigation items with links
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link href={subItem.url} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <subItem.icon className="size-3" />
                                  {subItem.title}
                                </div>
                              </Link>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="rounded-lg">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/signup" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
