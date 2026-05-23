import { Router, type IRouter } from "express";
import {
  GetLatestBriefResponse,
  ListBriefEventsResponse,
} from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapBriefEvents,
  mapLatestBrief,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/briefs/latest", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(GetLatestBriefResponse.parse(mapLatestBrief(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

router.get("/briefs/events", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(ListBriefEventsResponse.parse(mapBriefEvents(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

export default router;
