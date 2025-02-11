import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { UserCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function TopBar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 right-0 left-0 md:left-64 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <div className="space-y-4 py-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <div className="border-t pt-4">
                <p>Profile content goes here</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="icon"
          className="tour-theme"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}