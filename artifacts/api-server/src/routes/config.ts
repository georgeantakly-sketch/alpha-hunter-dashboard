import { Router, type IRouter } from "express";
import { ListConfigResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/config", async (req, res): Promise<void> => {
  const config = ListConfigResponse.parse([
    { id: 1, section: "Universe", setting: "max_universe_size", value: "100" },
    {
      id: 2,
      section: "Risk",
      setting: "risk_per_trade_pct",
      value: "1.0%",
    },
    {
      id: 3,
      section: "Risk",
      setting: "max_open_trades",
      value: "10",
    },
    {
      id: 4,
      section: "Risk",
      setting: "max_leverage",
      value: "3x",
    },
    {
      id: 5,
      section: "Risk",
      setting: "max_total_notional",
      value: "$50,000",
    },
    {
      id: 6,
      section: "Planner",
      setting: "min_rr",
      value: "2.0",
    },
    {
      id: 7,
      section: "Alerts",
      setting: "telegram_enabled",
      value: "false",
    },
  ]);
  res.json(config);
});

export default router;
