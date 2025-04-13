import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Calendar,
  Users,
  FileUp,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className={cn("h-screen w-64 bg-sidebar border-r", className)}>
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-sidebar-foreground">EduSchedule</h2>
          <p className="text-sm text-sidebar-foreground/60">
            {isAdmin ? "Admin Dashboard" : "Teacher Dashboard"}
          </p>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="p-3 flex-1">
          <nav className="space-y-2">
            {isAdmin ? (
              <>
                <Link href="/admin/dashboard">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/admin/dashboard" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Home className="mr-3 h-5 w-5" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/admin/teachers">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/admin/teachers" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Users className="mr-3 h-5 w-5" />
                    Teachers
                  </a>
                </Link>
                
                <Link href="/admin/timetable">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/admin/timetable" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Calendar className="mr-3 h-5 w-5" />
                    Timetable
                  </a>
                </Link>
                
                <Link href="/admin/data-import">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/admin/data-import" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <FileUp className="mr-3 h-5 w-5" />
                    Data Import
                  </a>
                </Link>
                
                <Link href="/admin/settings">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/admin/settings" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/teacher/dashboard">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/teacher/dashboard" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Home className="mr-3 h-5 w-5" />
                    Dashboard
                  </a>
                </Link>
                
                <Link href="/teacher/profile">
                  <a className={cn(
                    "flex items-center text-sm p-3 rounded-md hover:bg-sidebar-accent",
                    location === "/teacher/profile" && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <User className="mr-3 h-5 w-5" />
                    My Profile
                  </a>
                </Link>
              </>
            )}
          </nav>
        </div>
        
        <div className="p-4 mt-auto">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">
              <span className="font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
