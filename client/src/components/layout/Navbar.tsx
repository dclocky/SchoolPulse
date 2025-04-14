import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  ChevronDown,
  FileUp,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const userInitials = user
    ? getInitials(`${user.firstName} ${user.lastName}`)
    : "U";

  const isAdminRoute = location.startsWith("/admin");
  const isTeacherRoute = location.startsWith("/teacher");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">EduSchedule</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user?.role === "admin" && (
                <>
                  <Link href="/admin/dashboard">
                    <a
                      className={`${
                        location === "/admin/dashboard"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/teachers">
                    <a
                      className={`${
                        location === "/admin/teachers"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Teachers
                    </a>
                  </Link>
                  <Link href="/admin/timetable">
                    <a
                      className={`${
                        location === "/admin/timetable"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Timetable
                    </a>
                  </Link>
                  <Link href="/admin/data-import">
                    <a
                      className={`${
                        location === "/admin/data-import"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Data Import
                    </a>
                  </Link>
                  <Link href="/admin/settings">
                    <a
                      className={`${
                        location === "/admin/settings"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Settings
                    </a>
                  </Link>
                </>
              )}
              
              {user?.role === "teacher" && (
                <>
                  <Link href="/teacher/dashboard">
                    <a
                      className={`${
                        location === "/teacher/dashboard"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/teacher/profile">
                    <a
                      className={`${
                        location === "/teacher/profile"
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      My Profile
                    </a>
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user?.role === "admin" && (
              <>
                <Link href="/admin/dashboard">
                  <a
                    className={`${
                      location === "/admin/dashboard"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <Home className="inline-block mr-2 h-5 w-5" />
                    Dashboard
                  </a>
                </Link>
                <Link href="/admin/teachers">
                  <a
                    className={`${
                      location === "/admin/teachers"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <User className="inline-block mr-2 h-5 w-5" />
                    Teachers
                  </a>
                </Link>
                <Link href="/admin/timetable">
                  <a
                    className={`${
                      location === "/admin/timetable"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <Calendar className="inline-block mr-2 h-5 w-5" />
                    Timetable
                  </a>
                </Link>
                <Link href="/admin/data-import">
                  <a
                    className={`${
                      location === "/admin/data-import"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <FileUp className="inline-block mr-2 h-5 w-5" />
                    Data Import
                  </a>
                </Link>
                <Link href="/admin/settings">
                  <a
                    className={`${
                      location === "/admin/settings"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <Settings className="inline-block mr-2 h-5 w-5" />
                    Settings
                  </a>
                </Link>
              </>
            )}
            
            {user?.role === "teacher" && (
              <>
                <Link href="/teacher/dashboard">
                  <a
                    className={`${
                      location === "/teacher/dashboard"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <Home className="inline-block mr-2 h-5 w-5" />
                    Dashboard
                  </a>
                </Link>
                <Link href="/teacher/profile">
                  <a
                    className={`${
                      location === "/teacher/profile"
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <User className="inline-block mr-2 h-5 w-5" />
                    My Profile
                  </a>
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
