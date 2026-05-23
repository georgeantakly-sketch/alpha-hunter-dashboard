import {
  useGetSystemHealth,
  getGetSystemHealthQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle, XCircle, AlertCircle, ShieldCheck } from "lucide-react";

type ConnectorStatus = "healthy" | "disabled" | "off" | "warning" | string;

function StatusIndicator({ label, status }: { label: string; status: ConnectorStatus }) {
  const isHealthy = status === "healthy";
  const isWarning = status === "disabled" || status === "warning";
  const isError = status === "off";

  const colorClass = isHealthy
    ? "text-green-400 bg-green-500/10 border-green-500/20"
    : isWarning
    ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";

  const Icon = isHealthy ? CheckCircle : isWarning ? AlertCircle : XCircle;

  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-mono uppercase tracking-wider">{status}</span>
    </div>
  );
}

function SafetyItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-green-400">
      <CheckCircle className="w-4 h-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export default function System() {
  const { data: health, isLoading } = useGetSystemHealth({
    query: { queryKey: getGetSystemHealthQueryKey() },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Connector status and safety boundary check</p>
        </div>
      </div>

      {/* Connector Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connector Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </>
          ) : (
            <>
              <StatusIndicator label="Bybit Public Data" status={health?.bybitPublicData ?? "unknown"} />
              <StatusIndicator label="CoinGecko Context" status={health?.coinGeckoContext ?? "unknown"} />
              <StatusIndicator label="Telegram" status={health?.telegram ?? "unknown"} />
              <StatusIndicator label="Live Execution" status={health?.liveExecution ?? "unknown"} />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Boundary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <CardTitle className="text-base">Safety Boundary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <SafetyItem text="No live trading" />
            <SafetyItem text="No private exchange permissions" />
            <SafetyItem text="No real order routing" />
            <SafetyItem text="Telegram notifications only" />
          </CardContent>
        </Card>

        {/* Last Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <pre className="rounded-lg bg-black/50 border border-border p-4 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                <code>{JSON.stringify(
                  {
                    timestamp: health?.timestamp,
                    paper_only: health?.paperOnly,
                    db_initialized: health?.dbInitialized,
                    telegram_configured: health?.telegramConfigured,
                    live_execution: health?.liveExecution === "off" ? false : true,
                  },
                  null,
                  2
                )}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
