"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Home from "lucide-react/dist/esm/icons/home";
import Webhook from "lucide-react/dist/esm/icons/webhook";
import ListFilter from "lucide-react/dist/esm/icons/list-filter";
import Book from "lucide-react/dist/esm/icons/book";
import Settings from "lucide-react/dist/esm/icons/settings";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Menu from "lucide-react/dist/esm/icons/menu";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Endpoints",
    href: "/dashboard/endpoints",
    icon: Webhook,
  },
  {
    label: "Logs",
    href: "/dashboard/logs",
    icon: ListFilter,
  },
  {
    label: "Setup Guide",
    href: "/dashboard/setup",
    icon: Book,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
];

// Sidebar navigation component - reused in both desktop and mobile
function SidebarNav({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Webhook className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight">
            CalRouter
          </h1>
          <span className="text-xs font-medium text-muted-foreground">
            Webhook Enrichment
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2 px-4 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex w-full items-center gap-3 rounded-lg px-2 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold">
              Dashboard
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Manage your account
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <SidebarNav pathname={pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <SidebarNav pathname={pathname} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Webhook className="h-5 w-5" />
            </div>
            <h1 className="text-base font-bold leading-none tracking-tight">
              CalRouter
            </h1>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
