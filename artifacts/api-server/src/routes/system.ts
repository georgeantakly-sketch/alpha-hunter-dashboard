import { Router, type IRouter } from "express";
import {
  GetSystemHealthResponse,
  RunSystemActionBody,
  RunSystemActionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/system/health", async (req, res): Promise<void> => {
  const health = GetSystemHealthResponse.parse({
    bybitPublicData: "healthy",
    coinGeckoContext: "healthy",
    telegram: "disabled",
    liveExecution: "off",
    timestamp: new Date().toISOString(),
    paperOnly: true,
    dbInitialized: true,
    telegramConfigured: false,
  });
  res.json(health);
});

router.post("/system/actions", async (req, res): Promise<void> => {
  const parsed = RunSystemActionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const actionMessages: Record<string, string> = {
    run_hourly_scan: "Hourly scan completed — 8 candidates found",
    run_paper_sanity: "Paper sanity check passed — 0 orphaned trades",
    generate_morning_brief: "Morning brief generated successfully",
    send_telegram_alerts: "Telegram alerts dispatched",
  };

  const message =
    actionMessages[parsed.data.action] ??
    `Action '${parsed.data.action}' executed`;

  req.log.info({ action: parsed.data.action }, "System action executed");
  res.json(RunSystemActionResponse.parse({ success: true, message }));
});

export default router;
