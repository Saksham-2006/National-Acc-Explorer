import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart3, Globe, Activity, FileText, Settings } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/indicators", label: "Indicators", icon: Activity },
    { href: "/regions", label: "Regions", icon: Globe },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full print:hidden">
      <div className="p-4 border-b h-16 flex items-center">
        <div className="flex items-center gap-2 text-primary font-bold">
          <BarChart3 className="w-6 h-6" />
          <span className="text-lg">EconDash</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground mb-3 px-3 uppercase tracking-wider">
          Main
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>National Accounts Portal</p>
        <p className="mt-1">v2.4.1 (Stable)</p>
      </div>
    </aside>
  );
}
