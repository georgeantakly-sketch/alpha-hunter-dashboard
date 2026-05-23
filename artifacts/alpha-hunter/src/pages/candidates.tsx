import {
  useListCandidates,
  getListCandidatesQueryKey,
  useGetCandidateStats,
  getGetCandidateStatsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";

const STAGE_STYLES: Record<string, string> = {
  "Setup Candidate": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Watchlist: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Rejected: "bg-muted text-muted-foreground border-border",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : score >= 50
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <Badge variant="outline" className={color} data-testid={`score-badge-${score}`}>
      {score}
    </Badge>
  );
}

export default function Candidates() {
  const { data: candidates, isLoading: isLoadingCandidates } = useListCandidates({
    query: { queryKey: getListCandidatesQueryKey() },
  });

  const { data: stats, isLoading: isLoadingStats } = useGetCandidateStats({
    query: { queryKey: getGetCandidateStatsQueryKey() },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Candidates</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Attention &rarr; setup &rarr; trade planned &rarr; risk approved &rarr; paper trade
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Setup Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-3xl font-bold font-mono text-blue-400">{stats?.setupCandidates ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-3xl font-bold font-mono text-yellow-400">{stats?.watchlist ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-3xl font-bold font-mono text-muted-foreground">{stats?.rejected ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Review</CardTitle>
          <CardDescription>All symbols under evaluation this cycle</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCandidates ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Symbol</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Blocker / Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        No candidates this cycle
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates?.map((c) => (
                      <TableRow key={c.id} data-testid={`row-candidate-${c.id}`} className="hover:bg-muted/20">
                        <TableCell className="font-medium font-mono">{c.symbol}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{c.market}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{c.candidateType}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STAGE_STYLES[c.stage] ?? "border-border text-muted-foreground"}>
                            {c.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{c.setup}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <ScoreBadge score={c.score} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{c.blockerNote}</span>
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

      {/* Info notice */}
      <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary/80">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          TA is used to validate selected candidates and build trade plans. It is not the main
          universe-selection engine. Candidates are scored and filtered before reaching setup stage.
        </p>
      </div>
    </div>
  );
}
