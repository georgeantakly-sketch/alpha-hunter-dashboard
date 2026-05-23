import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/Shell";

import NotFound from "@/pages/not-found";
import Overview from "@/pages/overview";
import Trades from "@/pages/trades";
import Candidates from "@/pages/candidates";
import Risk from "@/pages/risk";
import Briefs from "@/pages/briefs";
import Config from "@/pages/config";
import System from "@/pages/system";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/trades" component={Trades} />
        <Route path="/candidates" component={Candidates} />
        <Route path="/risk" component={Risk} />
        <Route path="/briefs" component={Briefs} />
        <Route path="/config" component={Config} />
        <Route path="/system" component={System} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
