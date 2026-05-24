import { Router, type IRouter } from "express";
import {
  ListCandidatesResponse,
  GetCandidateStatsResponse,
} from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapCandidates,
  mapCandidateStats,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(ListCandidatesResponse.parse(mapCandidates(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

router.get("/candidates/stats", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(GetCandidateStatsResponse.parse(mapCandidateStats(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

export default router;
