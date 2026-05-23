import { Router, type IRouter } from "express";
import { ListConfigResponse } from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapConfigRows,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/config", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(ListConfigResponse.parse(mapConfigRows(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

export default router;
