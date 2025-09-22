import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

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
        <div className="ml-1 flex items-center gap-3">
          {loggedIn ? (
            <>
              <div className="text-sm text-gray-700">
                Signed in as <span className="font-semibold">{username ?? "User"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>Login</Button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <Input placeholder="Search…" className="h-9 w-64" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
