import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  FileQuestion,
  BarChart,
  Users,
  Video,
  Settings,
  LogOut,
  Menu,
  ScanBarcode,
  Sparkles,
  MessageSquare,
  BookOpen,
  Brain,
  Trophy,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tests",
      href: "/create-test",
      icon: <FileQuestion className="h-5 w-5" />,
    },
    {
      title: "Scan Tests",
      href: "/ocr-scan",
      icon: <ScanBarcode className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "AI Study Plans",
      href: "/ai-study-plans",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // If student, show a reduced menu
  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tests",
      href: "/tests",
      icon: <FileQuestion className="h-5 w-5" />,
    },
    {
      title: "My Progress",
      href: "/progress",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Resources",
      href: "/resources",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "AI Tutor",
      href: "/ai-tutor",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Study Groups",
      href: "/study-groups",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Achievements",
      href: "/achievements",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const items = user?.role === "student" ? studentNavItems : navItems;

  // Mobile hamburger menu
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      className="md:hidden p-0 h-9 w-9 rounded-full"
      onClick={toggleMobileMenu}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <MobileMenuButton />
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 flex h-screen flex-col bg-white dark:bg-neutral-900 shadow-md transition-transform z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "w-64 md:w-64",
          className
        )}
      >
        {/* Logo and title */}
        <div className="py-5 px-4 flex items-center border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-sm">
            MP
          </div>
          <h1 className="ml-3 font-bold text-lg">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Master Plan
            </span>
          </h1>
        </div>

        {/* User info */}
        <div className="mt-4 px-4 mb-6">
          <div className="flex items-center p-2 rounded-md bg-neutral-100 dark:bg-neutral-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 text-white flex items-center justify-center font-medium shadow-sm">
              {user?.name ? getInitials(user.name) : "U"}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="mb-2 px-3 text-xs uppercase font-medium text-muted-foreground">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {items.map((item, index) => {
              const isActive = location === item.href;
              return (
                <div key={item.href} className="block">
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm rounded-md transition-all group",
                      isActive
                        ? "text-primary bg-primary/10 dark:bg-primary/15 font-medium"
                        : "text-foreground/70 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                    )}
                  >
                    <span 
                      className={cn(
                        "mr-3 flex items-center justify-center w-5 h-5",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground/80"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                    {index === 0 && !isActive && (
                      <span className="ml-auto bg-primary/15 text-primary text-xs py-0.5 px-1.5 rounded-full">
                        New
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
          
          {user?.role === "student" && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs uppercase font-medium text-muted-foreground">
                Learning Tools
              </div>
              <div className="mb-2 bg-neutral-100 dark:bg-neutral-800/40 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium">Today's Progress</span>
                  <span className="text-xs text-primary font-medium">70%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700/30 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary/90 to-primary h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-md">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()} 
            className="rounded-md text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
