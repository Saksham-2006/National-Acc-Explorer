import { useState, useEffect } from "react";
import { Sun, Moon, Printer, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleRefresh = async () => {
    setIsSpinning(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0 print:hidden z-10 sticky top-0">
      <div>
        <h1 className="text-xl font-bold text-foreground">National Accounts Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-2.5 h-[28px] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F1F2",
            color: isDark ? "#c8c9cc" : "#4b5563",
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
          Refresh
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F1F2",
            color: isDark ? "#c8c9cc" : "#4b5563",
          }}
          title="Export as PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F1F2",
            color: isDark ? "#c8c9cc" : "#4b5563",
          }}
          title="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
