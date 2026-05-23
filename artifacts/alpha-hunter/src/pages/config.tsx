import {
  useListConfig,
  getListConfigQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, AlertTriangle } from "lucide-react";

export default function Config() {
  const { data: config, isLoading } = useListConfig({
    query: { queryKey: getListConfigQueryKey() },
  });

  const sections = config
    ? [...new Set(config.map((r) => r.section))]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Config</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Effective runtime configuration</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Config editing requires confirmation, audit logs, and rollback before it can be enabled.
          This view is read-only in the current build.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : sections.length > 0 ? (
        sections.map((section) => {
          const rows = config?.filter((r) => r.section === section) ?? [];
          return (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="text-base">{section}</CardTitle>
                <CardDescription>{rows.length} setting{rows.length !== 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Setting</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} data-testid={`row-config-${row.id}`} className="hover:bg-muted/20">
                          <TableCell className="font-mono text-sm">{row.setting}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="font-mono bg-muted/30 border-border text-foreground">
                              {row.value}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No configuration loaded
          </CardContent>
        </Card>
      )}
    </div>
  );
}
