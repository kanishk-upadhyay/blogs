import type { PropsWithChildren } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Search } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

type LayoutProps = PropsWithChildren;

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Search and Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <div className="relative w-full max-w-[100px] sm:max-w-[200px] md:max-w-[260px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-9 h-9 bg-muted/50 focus-visible:bg-background transition-colors"
                  defaultValue={new URLSearchParams(window.location.search).get("search") || ""}
                  onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    if (e.target.value) {
                      params.set("search", e.target.value);
                    } else {
                      params.delete("search");
                    }
                    navigate(`/?${params.toString()}`, { replace: true });
                  }}
                />
              </div>
              <ModeToggle />
            </div>

            {/* Center: Branding */}
            <div className="flex-0 mx-4">
              <Link to="/" className="text-2xl font-black tracking-tight hover:opacity-80 transition-opacity">
                Blogs
              </Link>
            </div>

            {/* Right: Auth & Actions */}
            <div className="flex items-center justify-end gap-2 flex-1">
              {user ? (
                <>
                  <Button onClick={() => navigate("/new")} size="sm" className="hidden sm:inline-flex">
                    New Blog
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 hidden sm:block">
                        <p className="text-sm font-medium">{user.username}</p>
                      </div>
                      <DropdownMenuSeparator className="hidden sm:block" />

                      <DropdownMenuItem onClick={() => navigate(`/users/${user.username}`)}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => navigate("/login")} className="px-2 sm:px-4">
                    Login
                  </Button>
                  <Button onClick={() => navigate("/register")} className="px-3 sm:px-4">
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header >

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div >
  );
}
