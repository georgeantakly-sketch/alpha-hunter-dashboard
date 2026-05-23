import { useState } from "react";
import {
  useListTrades,
  getListTradesQueryKey,
  useGetTradeExposure,
  getGetTradeExposureQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Watch: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Closed: "bg-muted text-muted-foreground border-border",
};

const SIDE_STYLES: Record<string, string> = {
  Long: "bg-green-500/10 text-green-400 border-green-500/20",
  Short: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Trades() {
  const [statusFilter, setStatusFilter] = useState<string[]>(["Open", "Watch"]);
  const [marketFilter, setMarketFilter] = useState<string[]>(["Spot", "Futures"]);

  const { data: trades, isLoading: isLoadingTrades } = useListTrades(
    {},
    { query: { queryKey: getListTradesQueryKey({}) } }
  );

  const { data: exposure, isLoading: isLoadingExposure } = useGetTradeExposure({
    query: { queryKey: getGetTradeExposureQueryKey() },
  });

  const filtered = trades?.filter(
    (t) => statusFilter.includes(t.status) && marketFilter.includes(t.market)
  );

  const toggleFilter = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Open Trades</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Local simulated trades only — no real Bybit orders.
        </p>
      </div>

      {exposure?.overCap && (
        <Alert className="border-red-500/50 bg-red-500/10 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Open risk is above the configured cap. Review positions before opening new paper trades.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2">
                {["Open", "Watch", "Closed"].map((s) => (
                  <button
                    key={s}
                    data-testid={`filter-status-${s}`}
                    onClick={() => toggleFilter(statusFilter, setStatusFilter, s)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                      statusFilter.includes(s)
                        ? STATUS_STYLES[s]
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Market</p>
              <div className="flex gap-2">
                {["Spot", "Futures"].map((m) => (
                  <button
                    key={m}
                    data-testid={`filter-market-${m}`}
                    onClick={() => toggleFilter(marketFilter, setMarketFilter, m)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                      marketFilter.includes(m)
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Book</CardTitle>
          <CardDescription>
            Showing {filtered?.length ?? 0} of {trades?.length ?? 0} trades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrades ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Symbol</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Stop</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">R:R</TableHead>
                    <TableHead className="text-right">Risk</TableHead>
                    <TableHead className="text-right">Notional</TableHead>
                    <TableHead className="text-right">PnL</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-muted-foreground py-10">
                        No trades match the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered?.map((trade) => (
                      <TableRow key={trade.id} data-testid={`row-trade-${trade.id}`} className="hover:bg-muted/20">
                        <TableCell className="font-medium font-mono">{trade.symbol}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{trade.market}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={SIDE_STYLES[trade.side]}>
                            {trade.side}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{trade.setup}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{trade.entry.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-red-400">{trade.stop.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-green-400">{trade.target1.toFixed(4)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{trade.rr}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{trade.riskPct}</TableCell>
                        <TableCell className="text-right font-mono text-sm">${trade.notional.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-mono text-sm font-semibold ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[trade.status]}>
                            {trade.status}
                          </Badge>
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

      {/* Exposure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Risk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExposure ? <Skeleton className="h-8 w-20" /> : (
              <div className={`text-2xl font-bold font-mono ${exposure?.overCap ? "text-red-400" : "text-foreground"}`}>
                {exposure?.openRiskPct ?? 0}%
                {exposure?.overCap && <span className="text-xs ml-2 text-red-400">Over cap</span>}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" /> Long Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExposure ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold font-mono text-green-400">
                ${exposure?.longExposure.toLocaleString() ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Short Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExposure ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold font-mono text-red-400">
                ${exposure?.shortExposure.toLocaleString() ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
