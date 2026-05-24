import { Router, type IRouter } from "express";
import { GetOverviewSummaryResponse } from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapOverviewSummary,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/overview/summary", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(GetOverviewSummaryResponse.parse(mapOverviewSummary(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

export default router;
