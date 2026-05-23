import { Router, type IRouter } from "express";
import {
  GetSystemHealthResponse,
  RunSystemActionBody,
  RunSystemActionResponse,
} from "@workspace/api-zod";
import {
  alphaUnavailablePayload,
  fetchAlphaHunterState,
  mapSystemHealth,
} from "../lib/alpha-hunter";

const router: IRouter = Router();

router.get("/system/health", async (req, res): Promise<void> => {
  try {
    const state = await fetchAlphaHunterState(String(req.query["market"] ?? "all"));
    res.json(GetSystemHealthResponse.parse(mapSystemHealth(state)));
  } catch (error) {
    res.status(503).json(alphaUnavailablePayload(error));
  }
});

router.post("/system/actions", async (req, res): Promise<void> => {
  const parsed = RunSystemActionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  req.log.warn({ action: parsed.data.action }, "Dashboard system actions are disabled");
  res.status(403).json(
    RunSystemActionResponse.parse({
      success: false,
      message: "Dashboard actions are disabled. Run Alpha Hunter commands from the operator terminal.",
    }),
  );
});

export default router;
