import { Router, type IRouter } from "express";
import {
  ListTradesQueryParams,
  ListTradesResponse,
  GetTradeExposureResponse,
} from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapExposure,
  mapTrades,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/trades", async (req, res): Promise<void> => {
  const params = ListTradesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const state = await fetchAlphaHunterState("all");
    let filtered = mapTrades(state);
    if (params.data.status) {
      filtered = filtered.filter((t) => t["status"] === params.data.status);
    }
    if (params.data.market) {
      filtered = filtered.filter((t) => t["market"] === params.data.market);
    }
    res.json(ListTradesResponse.parse(filtered));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

router.get("/trades/exposure", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState("all");
    res.json(GetTradeExposureResponse.parse(mapExposure(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

export default router;
