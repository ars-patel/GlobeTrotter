"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDaysIcon,
  CompassIcon,
  Globe2Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapIcon,
  MessagesSquareIcon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import type { PublicUser } from "@/lib/auth/session";

const NAV = [
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/search?type=city", label: "Search", icon: SearchIcon },
  { href: "/trips", label: "Trips", icon: MapIcon },
  { href: "/schedule", label: "Schedule", icon: CalendarDaysIcon },
  { href: "/community", label: "Community", icon: MessagesSquareIcon },
  { href: "/profile", label: "Profile", icon: UserRoundIcon },
] as const;

function navActive(pathname: string, href: string) {
  const base = href.split("?")[0] ?? href;
  if (base === "/search") {
    return pathname === "/search" || pathname.startsWith("/search/");
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const active = navActive(pathname, href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={label}
        render={
          <Link
            href={href}
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          />
        }
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user }: { user: PublicUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);
  const initials =
    `${user.first_name.slice(0, 1)}${user.last_name.slice(0, 1)}`.toUpperCase();

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="GlobeTrotter"
              render={
                <Link
                  href="/discover"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              }
            >
              <span className="flex size-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent">
                <Globe2Icon className="size-4" />
              </span>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">GlobeTrotter</span>
                <span className="truncate text-xs text-muted-foreground">
                  Plan your journey
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              {user.role === "ADMIN" ? (
                <NavLink
                  href="/admin"
                  label="Admin"
                  icon={LayoutDashboardIcon}
                />
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              isActive={pathname.startsWith("/profile")}
              render={
                <Link
                  href="/profile"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                {user.photo_url ? (
                  <AvatarImage src={user.photo_url} alt="" />
                ) : null}
                <AvatarFallback className="rounded-lg text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.first_name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log Out"
              disabled={loggingOut}
              onClick={() => void logout()}
            >
              {loggingOut ? <Spinner /> : <LogOutIcon />}
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
