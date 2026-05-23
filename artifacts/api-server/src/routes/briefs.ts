import { Router, type IRouter } from "express";
import {
  GetLatestBriefResponse,
  ListBriefEventsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/briefs/latest", async (req, res): Promise<void> => {
  const brief = GetLatestBriefResponse.parse({
    summary:
      "Open trades: 12. Latest scan run: 10. Brief generated after latest hourly scan: true. Notional cap exceeded; paper openings blocked until reconciliation.",
    generatedAt: new Date().toISOString(),
    openTrades: 12,
    latestScanRun: 10,
    briefGenerated: true,
    notionalCapExceeded: true,
  });
  res.json(brief);
});

router.get("/briefs/events", async (req, res): Promise<void> => {
  const events = ListBriefEventsResponse.parse([
    {
      id: 1,
      time: "08:00",
      event: "Morning brief generated",
      type: "Brief",
    },
    {
      id: 2,
      time: "09:00",
      event: "Hourly scan completed — 8 candidates",
      type: "Scan",
    },
    {
      id: 3,
      time: "09:02",
      event: "4 paper trades opened",
      type: "Paper",
    },
    {
      id: 4,
      time: "10:00",
      event: "Paper trades updated — no stops/targets hit",
      type: "Paper",
    },
    {
      id: 5,
      time: "10:03",
      event: "Warning: futures notional near cap",
      type: "Risk",
    },
  ]);
  res.json(events);
});

export default router;
