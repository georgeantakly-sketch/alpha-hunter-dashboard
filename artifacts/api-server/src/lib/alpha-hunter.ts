type AlphaState = Record<string, unknown>;

export class AlphaHunterUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlphaHunterUnavailableError";
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function arrayValue(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function boolValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function title(value: unknown, fallback = "Unknown"): string {
  const text = stringValue(value, fallback);
  if (!text) return fallback;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function riskConfig(state: AlphaState): Record<string, unknown> {
  return objectValue(objectValue(state["config"])["risk"]);
}

function demo(state: AlphaState): Record<string, unknown> {
  return objectValue(state["demo"]);
}

function demoEvidence(state: AlphaState): Record<string, unknown> {
  return objectValue(state["demo_evidence"]);
}

function demoLifecycle(state: AlphaState): Record<string, unknown> {
  return objectValue(state["demo_lifecycle"]);
}

function candidatesPayload(state: AlphaState): Record<string, unknown>[] {
  return arrayValue(objectValue(state["candidates"])["candidates"]);
}

function latestBrief(state: AlphaState): Record<string, unknown> {
  const rows = arrayValue(objectValue(state["briefs"])["latest"]);
  return rows[0] ?? {};
}

export async function fetchAlphaHunterState(market = "all"): Promise<AlphaState> {
  const baseUrl = process.env["ALPHA_HUNTER_API_URL"]?.replace(/\/+$/, "");
  const token = process.env["ALPHA_HUNTER_API_TOKEN"];
  if (!baseUrl || !token) {
    throw new AlphaHunterUnavailableError("Alpha Hunter API URL/token not configured");
  }
  const response = await fetch(`${baseUrl}/api/dashboard/state?market=${encodeURIComponent(market)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new AlphaHunterUnavailableError(`Alpha Hunter API returned ${response.status}`);
  }
  return (await response.json()) as AlphaState;
}

export function alphaUnavailablePayload(error: unknown): { error: string; message: string } {
  return {
    error: "alpha_hunter_unavailable",
    message: error instanceof Error ? error.message : "Alpha Hunter API unavailable",
  };
}

export function mapOverviewSummary(state: AlphaState): Record<string, unknown> {
  const evidence = demoEvidence(state);
  const risk = riskConfig(state);
  const status = objectValue(demo(state)["status"]);
  const scan = objectValue(state["candidates"]);
  const lifecycle = demoLifecycle(state);
  const execution = objectValue(state["execution"]);
  const openTrades = numberValue(evidence["positions_open"], numberValue(status["positions"]));
  const totalNotional = numberValue(evidence["open_position_notional"]);
  const cap = numberValue(risk["max_total_notional"]);
  return {
    openTrades,
    openTradesCap: numberValue(risk["max_open_trades"], 10),
    totalNotional,
    totalNotionalCap: cap,
    unrealizedPnl: numberValue(evidence["unrealized_pnl"]),
    safetyMode: stringValue(execution["mode"]) === "bybit_demo" ? "Demo" : "Read Only",
    symbolsScanned: numberValue(scan["scanned"]),
    attentionCandidates: numberValue(scan["attention_candidates_count"], candidatesPayload(state).length),
    setupCandidates: candidatesPayload(state).filter((row) => stringValue(row["stage"]).includes("SETUP")).length,
    paperTradesOpened: numberValue(evidence["fills_total"], numberValue(status["fills"])),
    capBreached: cap > 0 && totalNotional > cap,
    lastScan: stringValue(scan["latest_scan_timestamp"], "unknown"),
    lastPaperUpdate: stringValue(lifecycle["latest_update_timestamp"], "unknown"),
  };
}

export function mapTrades(state: AlphaState): Record<string, unknown>[] {
  return arrayValue(demo(state)["orders"]).map((row) => ({
    id: numberValue(row["id"]),
    symbol: stringValue(row["symbol"], "UNKNOWN"),
    market: title(row["market_type"]),
    side: title(row["side"]),
    setup: stringValue(row["setup_type"], "unknown"),
    entry: numberValue(row["price"]),
    stop: numberValue(row["stop_loss"]),
    target1: numberValue(row["target_1"]),
    rr: "n/a",
    riskPct: "n/a",
    notional: numberValue(row["qty"]) * numberValue(row["price"]),
    pnl: 0,
    status: stringValue(row["order_status"], "unknown"),
  }));
}

export function mapExposure(state: AlphaState): Record<string, unknown> {
  const positions = arrayValue(demo(state)["positions"]);
  let longExposure = 0;
  let shortExposure = 0;
  for (const position of positions) {
    const notional =
      Math.abs(numberValue(position["size"])) *
      numberValue(position["mark_price"], numberValue(position["avg_entry_price"]));
    if (stringValue(position["side"]).toLowerCase() === "short") shortExposure += notional;
    else longExposure += notional;
  }
  const total = longExposure + shortExposure;
  const cap = numberValue(riskConfig(state)["max_total_notional"]);
  return {
    openRiskPct: numberValue(riskConfig(state)["risk_per_trade_pct"]) * numberValue(demoEvidence(state)["positions_open"]),
    longExposure,
    shortExposure,
    overCap: cap > 0 && total > cap,
  };
}

export function mapCandidates(state: AlphaState): Record<string, unknown>[] {
  return candidatesPayload(state).map((row) => ({
    id: numberValue(row["id"]),
    symbol: stringValue(row["symbol"], "UNKNOWN"),
    market: title(row["market_type"]),
    candidateType: stringValue(row["candidate_type"], "unknown"),
    stage: stringValue(row["stage"], "unknown"),
    setup: stringValue(row["setup_type"], "unknown"),
    score: numberValue(row["opportunity_score"]),
    status: stringValue(row["status"], stringValue(row["final_status"], "unknown")),
    blockerNote: JSON.stringify(row["blockers"] ?? row["blockers_json"] ?? []),
  }));
}

export function mapCandidateStats(state: AlphaState): Record<string, unknown> {
  const rows = mapCandidates(state);
  return {
    setupCandidates: rows.filter((row) => stringValue(row["stage"]).includes("SETUP")).length,
    watchlist: rows.filter((row) => stringValue(row["status"]).toUpperCase().includes("WATCH")).length,
    rejected: rows.filter((row) => stringValue(row["status"]).toUpperCase().includes("REJECT")).length,
  };
}

export function mapLatestBrief(state: AlphaState): Record<string, unknown> {
  const brief = latestBrief(state);
  const evidence = demoEvidence(state);
  return {
    summary: stringValue(
      objectValue(brief["content_json"])["summary"],
      `Demo open positions: ${numberValue(evidence["positions_open"])}. Open orders: ${numberValue(evidence["open_orders"])}.`,
    ),
    generatedAt: stringValue(brief["created_at"], new Date(0).toISOString()),
    openTrades: numberValue(evidence["positions_open"]),
    latestScanRun: numberValue(objectValue(state["candidates"])["latest_scan_run_id"]),
    briefGenerated: Boolean(brief["id"] ?? brief["created_at"]),
    notionalCapExceeded: numberValue(demoEvidence(state)["open_position_notional"]) > numberValue(riskConfig(state)["max_total_notional"]),
  };
}

export function mapBriefEvents(state: AlphaState): Record<string, unknown>[] {
  return arrayValue(objectValue(state["audit"])["execution_events"]).slice(0, 20).map((row, index) => ({
    id: numberValue(row["id"], index + 1),
    time: stringValue(row["timestamp"], "unknown"),
    event: stringValue(row["event_type"], "execution_event"),
    type: stringValue(row["status"], "Audit"),
  }));
}

export function mapConfigRows(state: AlphaState): Record<string, unknown>[] {
  const config = objectValue(state["config"]);
  const rows: Record<string, unknown>[] = [];
  let id = 1;
  for (const [section, values] of Object.entries(config)) {
    if (!values || typeof values !== "object" || Array.isArray(values)) continue;
    for (const [setting, value] of Object.entries(values as Record<string, unknown>)) {
      rows.push({ id, section, setting, value: String(value) });
      id += 1;
    }
  }
  return rows;
}

export function mapSystemHealth(state: AlphaState): Record<string, unknown> {
  const config = objectValue(state["config"]);
  const telegram = objectValue(config["telegram"]);
  const health = objectValue(state["health"]);
  const execution = objectValue(state["execution"]);
  return {
    bybitPublicData: boolValue(health["db_initialized"], false) ? "healthy" : "unknown",
    coinGeckoContext: "unknown",
    telegram: telegram["bot_token"] ? "enabled" : "disabled",
    liveExecution: boolValue(execution["live_orders_allowed"], false) ? "on" : "off",
    timestamp: new Date().toISOString(),
    paperOnly: !boolValue(execution["live_orders_allowed"], false),
    dbInitialized: boolValue(health["db_initialized"], false),
    telegramConfigured: Boolean(telegram["bot_token"] && telegram["chat_id"]),
  };
}
