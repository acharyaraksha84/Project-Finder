import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Home, User, Sparkles, BarChart3, Heart } from "lucide-react";

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#gradient)" />
    <path d="M20 10L25 18H15L20 10Z" fill="white" />
    <path d="M20 30L15 22H25L20 30Z" fill="white" />
    <circle cx="20" cy="20" r="3" fill="white" />
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#667eea" />
        <stop offset="1" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Home", path: "/", icon: Home, testId: "nav-home" },
    { name: "Profile", path: "/profile", icon: User, testId: "nav-profile" },
    { name: "Recommendations", path: "/recommendations", icon: Sparkles, testId: "nav-recommendations" },
    { name: "Analytics", path: "/analytics", icon: BarChart3, testId: "nav-analytics" },
    { name: "Saved", path: "/saved", icon: Heart, testId: "nav-saved" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            data-testid="logo-btn"
          >
            <Logo />
            <h1 className="text-2xl font-bold gradient-text hidden sm:block">Project Finder</h1>
          </button>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  data-testid={item.testId}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 ${isActive(item.path) ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <Button
            data-testid="theme-toggle-btn"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-around mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                data-testid={`${item.testId}-mobile`}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;