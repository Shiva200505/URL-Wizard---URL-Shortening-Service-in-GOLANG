import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { 
  BellIcon, 
  ChevronDownIcon, 
  MenuIcon, 
  XIcon,
  UserIcon,
  LogOutIcon,
  LayoutDashboardIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = user ? [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Links", href: "/dashboard" },
    { name: "Analytics", href: "/dashboard" },
  ] : [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a>
                  <Logo />
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      location === item.href
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-5 w-5" />
                  <span className="sr-only">View notifications</span>
                </Button>
                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative rounded-full flex items-center">
                        <span className="sr-only">Open user menu</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-medium text-sm">
                        Signed in as {user.username}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <div className="flex items-center w-full">
                            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                            Dashboard
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <div className="flex items-center w-full">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Profile
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div 
        className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: mobileMenuOpen ? 'auto' : 0,
          opacity: mobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={`${
                  location === item.href
                    ? "bg-primary border-primary text-white"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            </Link>
          ))}

          {!user && (
            <Link href="/auth">
              <a
                className="block w-full text-center px-4 py-2 bg-primary text-white rounded-md shadow-sm mt-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </a>
            </Link>
          )}
        </div>

        {user && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.username}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/dashboard">
                <a
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/settings">
                <a
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </a>
              </Link>
              <button
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </nav>
  );
}
