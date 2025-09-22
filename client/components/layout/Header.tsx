import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setLoggedIn(localStorage.getItem("auth.loggedIn") === "true");
      setUsername(
        localStorage.getItem("auth.username") ||
          localStorage.getItem("remember.username") ||
          null,
      );
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const onLogout = () => {
    localStorage.removeItem("auth.loggedIn");
    localStorage.removeItem("auth.username");
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger />
        <div className="ml-1 text-lg font-semibold">Dashboard</div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <Input placeholder="Search…" className="h-9 w-64" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" aria-label="User menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{(username?.[0]?.toUpperCase() || "A")}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {loggedIn ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Signed in as</span>
                      <span className="font-medium">{username ?? "User"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
