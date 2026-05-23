import { Router, type IRouter } from "express";
import {
  ListTradesQueryParams,
  ListTradesResponse,
  GetTradeExposureResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const allTrades = [
  {
    id: 1,
    symbol: "FFUSDT",
    market: "Futures",
    side: "Long",
    setup: "futures_breakout_long",
    entry: 0.0899905,
    stop: 0.0879805,
    target1: 0.0940105,
    rr: "2.0R",
    riskPct: "1.0%",
    notional: 4188.35,
    pnl: -5.0,
    status: "Open",
  },
  {
    id: 2,
    symbol: "WIFUSDT",
    market: "Futures",
    side: "Short",
    setup: "futures_breakdown_short",
    entry: 2.184,
    stop: 2.236,
    target1: 2.08,
    rr: "2.1R",
    riskPct: "1.0%",
    notional: 5200.0,
    pnl: 18.4,
    status: "Open",
  },
  {
    id: 3,
    symbol: "SOLUSDT",
    market: "Spot",
    side: "Long",
    setup: "spot_reclaim_long",
    entry: 183.2,
    stop: 177.9,
    target1: 194.0,
    rr: "2.0R",
    riskPct: "1.0%",
    notional: 3500.0,
    pnl: 9.15,
    status: "Watch",
  },
  {
    id: 4,
    symbol: "BTCUSDT",
    market: "Futures",
    side: "Long",
    setup: "futures_breakout_long",
    entry: 68500.0,
    stop: 66800.0,
    target1: 72000.0,
    rr: "2.1R",
    riskPct: "1.0%",
    notional: 6850.0,
    pnl: 42.3,
    status: "Open",
  },
  {
    id: 5,
    symbol: "ETHUSDT",
    market: "Spot",
    side: "Long",
    setup: "spot_pullback_long",
    entry: 3520.0,
    stop: 3420.0,
    target1: 3720.0,
    rr: "2.0R",
    riskPct: "1.0%",
    notional: 3520.0,
    pnl: 15.2,
    status: "Open",
  },
  {
    id: 6,
    symbol: "BNBUSDT",
    market: "Futures",
    side: "Short",
    setup: "futures_breakdown_short",
    entry: 612.0,
    stop: 628.0,
    target1: 580.0,
    rr: "2.0R",
    riskPct: "1.0%",
    notional: 3060.0,
    pnl: -2.8,
    status: "Watch",
  },
  {
    id: 7,
    symbol: "AVAXUSDT",
    market: "Spot",
    side: "Long",
    setup: "spot_reclaim_long",
    entry: 38.5,
    stop: 37.2,
    target1: 41.1,
    rr: "2.0R",
    riskPct: "1.0%",
    notional: 3850.0,
    pnl: 5.1,
    status: "Open",
  },
];

router.get("/trades", async (req, res): Promise<void> => {
  const params = ListTradesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let filtered = allTrades;
  if (params.data.status) {
    filtered = filtered.filter((t) => t.status === params.data.status);
  }
  if (params.data.market) {
    filtered = filtered.filter((t) => t.market === params.data.market);
  }

  res.json(ListTradesResponse.parse(filtered));
});

router.get("/trades/exposure", async (req, res): Promise<void> => {
  const exposure = GetTradeExposureResponse.parse({
    openRiskPct: 12,
    longExposure: 7700,
    shortExposure: 5200,
    overCap: true,
  });
  res.json(exposure);
});

export default router;
