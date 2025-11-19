import { Users, Building2, UserCog, CheckSquare, LayoutDashboard, FileText, Home,CheckCircle  } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: LayoutDashboard, label: "Task-management", path: "/monday-view" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon:CheckCircle, label: "Completed Tasks", path: "/completed-tasks"},
    { icon: Users, label: "Clients", path: "/clients" },
    { icon: Building2, label: "Entities", path: "/entities" },
    { icon: UserCog, label: "Managers", path: "/managers" },
    
    { icon: FileText, label: "Provisions", path: "/provisions" }
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Desktop Side Navigation */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-card border-r p-4 space-y-2 tour-navigation">
        <div className="mb-6 px-4">
          <h2 className="text-lg font-bold">Task Management</h2>
          <p className="text-sm text-muted-foreground">Current page: {location}</p>
        </div>
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-1 z-50">
        <div className="grid grid-cols-7 gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                size="icon"
                className="w-full h-12"
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}