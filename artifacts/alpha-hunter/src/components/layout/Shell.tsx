import { Link, useLocation } from "wouter";
import { useRunSystemAction } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  BarChart2, 
  Briefcase, 
  Crosshair, 
  FileText, 
  Settings, 
  ShieldAlert,
  Play,
  Zap,
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const runAction = useRunSystemAction();

  const handleAction = (action: string, label: string) => {
    runAction.mutate(
      { data: { action } },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast({
              title: "Action Successful",
              description: data.message || `Successfully executed: ${label}`,
            });
          } else {
            toast({
              title: "Action Failed",
              description: data.message || `Failed to execute: ${label}`,
              variant: "destructive",
            });
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: `Network error while executing ${label}`,
            variant: "destructive",
          });
        }
      }
    );
  };

  const navItems = [
    { href: "/", label: "Overview", icon: Activity },
    { href: "/trades", label: "Open Trades", icon: Briefcase },
    { href: "/candidates", label: "Candidates", icon: Crosshair },
    { href: "/risk", label: "Risk & Exposure", icon: ShieldAlert },
    { href: "/briefs", label: "Briefs", icon: FileText },
    { href: "/config", label: "Config", icon: Settings },
    { href: "/system", label: "System Health", icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Crosshair className="w-5 h-5" />
            Alpha Hunter
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Spot + Futures Paper Desk
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">Mode</h3>
            <div className="flex flex-col gap-1.5">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 w-fit">
                Paper trading only
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 w-fit">
                Telegram disabled
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 w-fit">
                Live execution OFF
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-sidebar-border hover:border-primary/50"
                onClick={() => handleAction("run_hourly_scan", "Hourly Scan")}
                disabled={runAction.isPending}
              >
                <Zap className="w-3.5 h-3.5 mr-2" />
                Run hourly scan
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-sidebar-border hover:border-primary/50"
                onClick={() => handleAction("run_paper_sanity", "Paper Sanity")}
                disabled={runAction.isPending}
              >
                <Play className="w-3.5 h-3.5 mr-2" />
                Run paper sanity
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-sidebar-border hover:border-primary/50"
                onClick={() => handleAction("generate_morning_brief", "Morning Brief")}
                disabled={runAction.isPending}
              >
                <FileText className="w-3.5 h-3.5 mr-2" />
                Generate morning brief
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs border-sidebar-border hover:border-primary/50"
                onClick={() => handleAction("send_telegram_alerts", "Telegram Alerts")}
                disabled={runAction.isPending}
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Send Telegram alerts
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
