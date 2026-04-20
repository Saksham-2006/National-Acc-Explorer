import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Monitor, Palette, Globe, RefreshCw } from "lucide-react";

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggle(on: boolean) {
    if (on) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsDark(on);
    localStorage.setItem("theme", on ? "dark" : "light");
  }

  return { isDark, toggle };
}

export function Settings() {
  const { isDark, toggle } = useDarkMode();
  const [currency, setCurrency] = useState("USD");
  const [dataRange, setDataRange] = useState("all");
  const [chartAnimation, setChartAnimation] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize your dashboard experience and display preferences.</p>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
              <div>
                <Label className="text-sm font-medium cursor-pointer" htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark interface</p>
              </div>
            </div>
            <Switch id="dark-mode" checked={isDark} onCheckedChange={toggle} />
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium cursor-pointer" htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Reduce padding and spacing for denser layout</p>
              </div>
            </div>
            <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium cursor-pointer" htmlFor="chart-anim">Chart Animations</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enable animated chart rendering on data load</p>
              </div>
            </div>
            <Switch id="chart-anim" checked={chartAnimation} onCheckedChange={setChartAnimation} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Data Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Display Currency</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Currency unit for monetary values</p>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Default Year Range</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Initial time range shown on dashboard load</p>
            </div>
            <Select value={dataRange} onValueChange={setDataRange}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years (2015–2025)</SelectItem>
                <SelectItem value="5">Last 5 Years</SelectItem>
                <SelectItem value="3">Last 3 Years</SelectItem>
                <SelectItem value="1">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">About</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">National Accounts Dashboard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">v2.4.1 (Stable)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Coverage</span>
              <span className="font-medium">2015 – 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Indicators</span>
              <span className="font-medium">GDP, GNP, NDP, Inflation, Unemployment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">April 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
