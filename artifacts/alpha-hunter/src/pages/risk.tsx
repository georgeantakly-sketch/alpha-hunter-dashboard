import {
  useGetOverviewSummary,
  getGetOverviewSummaryQueryKey,
  useGetTradeExposure,
  getGetTradeExposureQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";

function MetricRow({ label, value, isLoading }: { label: string; value?: string; isLoading?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {isLoading ? (
        <Skeleton className="h-5 w-20" />
      ) : (
        <span className="font-mono font-semibold text-foreground">{value}</span>
      )}
    </div>
  );
}

function AlertRow({ text, variant }: { text: string; variant: "error" | "warning" | "success" }) {
  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
  };
  const icons = {
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${styles[variant]}`}>
      {icons[variant]}
      <span>{text}</span>
    </div>
  );
}

export default function Risk() {
  const { data: summary, isLoading: isLoadingSummary } = useGetOverviewSummary({
    query: { queryKey: getGetOverviewSummaryQueryKey() },
  });

  const { data: exposure, isLoading: isLoadingExposure } = useGetTradeExposure({
    query: { queryKey: getGetTradeExposureQueryKey() },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Risk & Exposure</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Live cap monitoring and safety controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricRow
              label="Open Trades"
              value={`${summary?.openTrades ?? "—"} / ${summary?.openTradesCap ?? "—"}`}
              isLoading={isLoadingSummary}
            />
            <MetricRow
              label="Total Notional"
              value={
                summary
                  ? `$${summary.totalNotional.toLocaleString()} / $${summary.totalNotionalCap.toLocaleString()}`
                  : "—"
              }
              isLoading={isLoadingSummary}
            />
            <MetricRow
              label="Risk Per Trade"
              value={`${exposure?.openRiskPct ?? "—"}%`}
              isLoading={isLoadingExposure}
            />
            <MetricRow
              label="Long Exposure"
              value={exposure ? `$${exposure.longExposure.toLocaleString()}` : "—"}
              isLoading={isLoadingExposure}
            />
            <MetricRow
              label="Short Exposure"
              value={exposure ? `$${exposure.shortExposure.toLocaleString()}` : "—"}
              isLoading={isLoadingExposure}
            />
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSummary ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                {summary?.openTrades && summary.openTrades > summary.openTradesCap && (
                  <AlertRow
                    variant="error"
                    text={`Cap breach: max_open_trades exceeded (${summary.openTrades} / ${summary.openTradesCap})`}
                  />
                )}
                {summary?.totalNotional && summary.totalNotional > summary.totalNotionalCap && (
                  <AlertRow
                    variant="error"
                    text={`Cap breach: max_total_notional exceeded ($${summary.totalNotional.toLocaleString()} / $${summary.totalNotionalCap.toLocaleString()})`}
                  />
                )}
                <AlertRow
                  variant="warning"
                  text="Duplicate open symbol/side/market combo detected"
                />
                <AlertRow
                  variant="success"
                  text="New paper openings blocked while over cap"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Local Paper Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Run these commands to reconcile the paper book before resuming normal operations.
          </p>
          <pre className="rounded-lg bg-black/50 border border-border p-4 text-xs font-mono text-green-400 overflow-x-auto">
            <code>{`python -m futures_alpha_hunter paper-sanity --market all\npython -m futures_alpha_hunter paper-reconcile --market all`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
