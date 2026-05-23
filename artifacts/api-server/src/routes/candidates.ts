import { Router, type IRouter } from "express";
import {
  ListCandidatesResponse,
  GetCandidateStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const candidates = [
  {
    id: 1,
    symbol: "TIAUSDT",
    market: "Futures",
    candidateType: "futures_short",
    stage: "Setup Candidate",
    setup: "breakdown_short",
    score: 76,
    status: "Setup",
    blockerNote: "Needs clean retest",
  },
  {
    id: 2,
    symbol: "SUIUSDT",
    market: "Spot",
    candidateType: "spot_long",
    stage: "Watchlist",
    setup: "pullback_long",
    score: 68,
    status: "Watchlist",
    blockerNote: "R:R below 2.0",
  },
  {
    id: 3,
    symbol: "XRPUSDT",
    market: "Futures",
    candidateType: "futures_short",
    stage: "Rejected",
    setup: "volume_only_signal",
    score: 51,
    status: "Rejected",
    blockerNote: "No clear setup",
  },
  {
    id: 4,
    symbol: "APTUSDT",
    market: "Futures",
    candidateType: "futures_long",
    stage: "Setup Candidate",
    setup: "breakout_long",
    score: 82,
    status: "Setup",
    blockerNote: "Waiting for volume confirmation",
  },
  {
    id: 5,
    symbol: "ARBUSDT",
    market: "Spot",
    candidateType: "spot_long",
    stage: "Watchlist",
    setup: "support_reclaim",
    score: 65,
    status: "Watchlist",
    blockerNote: "Spread too wide",
  },
  {
    id: 6,
    symbol: "DOGEUSDT",
    market: "Futures",
    candidateType: "futures_short",
    stage: "Rejected",
    setup: "momentum_fade",
    score: 44,
    status: "Rejected",
    blockerNote: "Sentiment override",
  },
  {
    id: 7,
    symbol: "OPUSDT",
    market: "Spot",
    candidateType: "spot_long",
    stage: "Rejected",
    setup: "range_breakout",
    score: 38,
    status: "Rejected",
    blockerNote: "Low liquidity",
  },
];

router.get("/candidates", async (req, res): Promise<void> => {
  res.json(ListCandidatesResponse.parse(candidates));
});

router.get("/candidates/stats", async (req, res): Promise<void> => {
  const stats = GetCandidateStatsResponse.parse({
    setupCandidates: 4,
    watchlist: 5,
    rejected: 7,
  });
  res.json(stats);
});

export default router;
