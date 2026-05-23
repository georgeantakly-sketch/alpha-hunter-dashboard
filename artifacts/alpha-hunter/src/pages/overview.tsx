import {
  useGetOverviewSummary,
  getGetOverviewSummaryQueryKey,
  useListTrades,
  getListTradesQueryKey,
  useListBriefEvents,
  getListBriefEventsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, ShieldCheck, Activity } from "lucide-react";

export default function Overview() {
  const { data: summary, isLoading: isLoadingSummary } = useGetOverviewSummary({
    query: { queryKey: getGetOverviewSummaryQueryKey() }
  });

  const { data: trades, isLoading: isLoadingTrades } = useListTrades(
    { status: "Open" },
    { query: { queryKey: getListTradesQueryKey({ status: "Open" }) } }
  );

  const { data: events, isLoading: isLoadingEvents } = useListBriefEvents({
    query: { queryKey: getListBriefEventsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Key metrics and recent activity across all paper accounts.</p>
      </div>

      {summary?.capBreached && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Risk Cap Breached</AlertTitle>
          <AlertDescription>
            Total notional or open trades cap has been exceeded. Check Risk & Exposure tab for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold font-mono">{summary?.openTrades || 0}</div>
                <div className="text-xs text-muted-foreground">/ {summary?.openTradesCap || 0} cap</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Notional</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold font-mono">
                  ${summary?.totalNotional.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </div>
                <div className="text-xs text-muted-foreground">
                  / ${summary?.totalNotionalCap.toLocaleString()} cap
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized PnL</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-3xl font-bold font-mono ${
                (summary?.unrealizedPnl || 0) >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {(summary?.unrealizedPnl || 0) >= 0 ? "+" : "-"}${Math.abs(summary?.unrealizedPnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Safety Mode</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-xl font-bold mt-1 text-primary">
                {summary?.safetyMode || "Standard"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Trades Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>Live monitoring of active paper trades</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTrades ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Entry</TableHead>
                        <TableHead className="text-right">Notional</TableHead>
                        <TableHead className="text-right">Unrealized PnL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No open trades
                          </TableCell>
                        </TableRow>
                      ) : (
                        trades?.map((trade) => (
                          <TableRow key={trade.id}>
                            <TableCell className="font-medium">
                              {trade.symbol}
                              <Badge variant="outline" className="ml-2 text-[10px] h-4">
                                {trade.market}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={trade.side === "Long" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"} variant="outline">
                                {trade.side}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">${trade.entry.toFixed(4)}</TableCell>
                            <TableCell className="text-right font-mono">${trade.notional.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-mono ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Log */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Live Event Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {events?.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <div className="text-muted-foreground font-mono shrink-0">
                        {event.time.split('T')[1]?.substring(0, 8) || event.time}
                      </div>
                      <div className="flex-1">
                        <span className={`mr-2 font-medium ${
                          event.type === 'Risk' ? 'text-red-500' :
                          event.type === 'Paper' ? 'text-blue-500' :
                          'text-muted-foreground'
                        }`}>
                          [{event.type}]
                        </span>
                        <span className="text-foreground">{event.event}</span>
                      </div>
                    </div>
                  ))}
                  {(!events || events.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No recent events
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
