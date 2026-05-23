import { Router, type IRouter } from "express";
import { GetOverviewSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/overview/summary", async (req, res): Promise<void> => {
  const summary = GetOverviewSummaryResponse.parse({
    openTrades: 12,
    openTradesCap: 10,
    totalNotional: 55600,
    totalNotionalCap: 50000,
    unrealizedPnl: 82.57,
    safetyMode: "Paper",
    symbolsScanned: 99,
    attentionCandidates: 8,
    setupCandidates: 4,
    paperTradesOpened: 4,
    capBreached: true,
    lastScan: "10:00",
    lastPaperUpdate: "10:03",
  });
  res.json(summary);
});

export default router;
