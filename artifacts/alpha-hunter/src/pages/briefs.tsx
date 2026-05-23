import {
  useGetLatestBrief,
  getGetLatestBriefQueryKey,
  useListBriefEvents,
  getListBriefEventsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, AlertCircle } from "lucide-react";

const EVENT_TYPE_STYLES: Record<string, string> = {
  Risk: "bg-red-500/10 text-red-400 border-red-500/20",
  Paper: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Scan: "bg-primary/10 text-primary border-primary/20",
  Brief: "bg-muted text-muted-foreground border-border",
};

export default function Briefs() {
  const { data: brief, isLoading: isLoadingBrief } = useGetLatestBrief({
    query: { queryKey: getGetLatestBriefQueryKey() },
  });

  const { data: events, isLoading: isLoadingEvents } = useListBriefEvents({
    query: { queryKey: getListBriefEventsQueryKey() },
  });

  const generatedAt = brief?.generatedAt
    ? new Date(brief.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Briefs</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Morning briefs and hourly scan summaries</p>
        </div>
      </div>

      {/* Latest Brief */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Latest Morning Brief</CardTitle>
              {generatedAt && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> Generated at {generatedAt}
                </CardDescription>
              )}
            </div>
            {brief?.briefGenerated !== undefined && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                Generated
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingBrief ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed">{brief?.summary}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Open Trades</p>
                  <p className="text-xl font-bold font-mono mt-1">{brief?.openTrades ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Scan Run</p>
                  <p className="text-xl font-bold font-mono mt-1">{brief?.latestScanRun ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Brief Generated</p>
                  <p className="text-xl font-bold font-mono mt-1">{brief?.briefGenerated ? "Yes" : "No"}</p>
                </div>
                <div className={`rounded-lg border p-3 ${brief?.notionalCapExceeded ? "border-red-500/30 bg-red-500/10" : "border-border bg-muted/20"}`}>
                  <p className="text-xs text-muted-foreground">Notional Cap</p>
                  <p className={`text-xl font-bold font-mono mt-1 flex items-center gap-1 ${brief?.notionalCapExceeded ? "text-red-400" : "text-green-400"}`}>
                    {brief?.notionalCapExceeded ? (
                      <><AlertCircle className="w-4 h-4" /> Breached</>
                    ) : "OK"}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Brief Timeline</CardTitle>
          <CardDescription>Chronological log of scan and trading events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-24">Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-sm text-muted-foreground">{event.time}</TableCell>
                      <TableCell className="text-sm">{event.event}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={EVENT_TYPE_STYLES[event.type] ?? "border-border text-muted-foreground"}>
                          {event.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No events recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
