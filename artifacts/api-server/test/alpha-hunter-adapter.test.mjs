import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import { test } from "node:test";

const alphaState = {
  read_only: true,
  config: {
    risk: {
      max_open_trades: 10,
      max_total_notional: 50000,
      risk_per_trade_pct: 1.0,
    },
    telegram: { bot_token: null, chat_id: null },
  },
  health: { db_initialized: true },
  execution: {
    mode: "bybit_demo",
    demo_orders_allowed: true,
    live_orders_allowed: false,
  },
  candidates: {
    candidates: [
      {
        id: 11,
        symbol: "KITEUSDT",
        market_type: "futures",
        candidate_type: "futures_short",
        stage: "RISK_APPROVED",
        status: "RISK_APPROVED",
        setup_type: "futures_rejection_short",
        opportunity_score: 82,
        blockers: [],
      },
    ],
  },
  paper: {
    sanity: {
      cap_ok: true,
      open_trade_count: 0,
      total_notional: 0,
      warnings: [],
    },
  },
  demo: {
    status: {
      orders_by_status: { New: 2, Filled: 1 },
      positions: 1,
      fills: 3,
    },
    orders: [
      {
        id: 5,
        symbol: "KITEUSDT",
        market_type: "futures",
        side: "short",
        setup_type: "futures_rejection_short",
        order_status: "New",
        price: 0.21098,
        stop_loss: 0.21623,
        target_1: 0.19425,
        qty: 19053,
      },
    ],
    positions: [
      {
        symbol: "KITEUSDT",
        market_type: "futures",
        side: "short",
        size: 19053,
        avg_entry_price: 0.21098,
        mark_price: 0.209,
        unrealized_pnl: 37.72,
      },
    ],
    fills: [{ id: 1 }, { id: 2 }, { id: 3 }],
  },
  demo_evidence: {
    positions_open: 1,
    open_position_notional: 3982.077,
    unrealized_pnl: 37.72,
    open_orders: 2,
    fills_total: 3,
  },
  demo_lifecycle: {
    stale_open_orders: 0,
    orders_without_tp: 0,
    orders_without_sl: 0,
    warnings: [],
  },
  demo_performance: {
    average_fill_slippage_bps: -2.5,
    rejection_rate_pct: 0,
  },
  data_quality: { latest_runs: [{ passed: 1 }] },
  validations: { backtests: [{ status: "passed" }] },
  audit: { execution_events: [] },
};

function listen(server, port = 0) {
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function withFakeAlphaServer(handler) {
  const calls = [];
  const server = http.createServer((req, res) => {
    calls.push({ url: req.url, authorization: req.headers.authorization });
    if (req.url?.startsWith("/api/dashboard/state")) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(alphaState));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not_found" }));
  });
  const port = await listen(server);
  try {
    await handler(`http://127.0.0.1:${port}`, calls);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function getFreePort() {
  const server = http.createServer();
  const port = await listen(server);
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForDashboard(baseUrl) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/healthz`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("dashboard server did not start");
}

async function withDashboardServer(env, handler) {
  const port = await getFreePort();
  const child = spawn(process.execPath, ["--enable-source-maps", "./dist/index.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, ...env, PORT: String(port) },
    stdio: "ignore",
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForDashboard(baseUrl);
    await handler(baseUrl);
  } finally {
    child.kill();
  }
}

test("dashboard routes map Alpha Hunter state instead of mock data", async () => {
  await withFakeAlphaServer(async (alphaUrl, calls) => {
    await withDashboardServer(
      {
        ALPHA_HUNTER_API_URL: alphaUrl,
        ALPHA_HUNTER_API_TOKEN: "adapter-token",
      },
      async (baseUrl) => {
        const overview = await (await fetch(`${baseUrl}/api/overview/summary`)).json();
        assert.equal(overview.safetyMode, "Demo");
        assert.equal(overview.openTrades, 1);
        assert.equal(overview.totalNotional, 3982.077);
        assert.equal(overview.unrealizedPnl, 37.72);
        assert.equal(overview.paperTradesOpened, 3);

        const trades = await (await fetch(`${baseUrl}/api/trades`)).json();
        assert.equal(trades.length, 1);
        assert.equal(trades[0].symbol, "KITEUSDT");
        assert.equal(trades[0].status, "New");
        assert.equal(trades[0].setup, "futures_rejection_short");

        const candidates = await (await fetch(`${baseUrl}/api/candidates`)).json();
        assert.equal(candidates[0].symbol, "KITEUSDT");
        assert.equal(candidates[0].stage, "RISK_APPROVED");

        assert.ok(calls.some((call) => call.authorization === "Bearer adapter-token"));
      },
    );
  });
});

test("dashboard degrades cleanly when Alpha Hunter is unavailable", async () => {
  await withDashboardServer(
    {
      ALPHA_HUNTER_API_URL: "http://127.0.0.1:9",
      ALPHA_HUNTER_API_TOKEN: "adapter-token",
    },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/overview/summary`);
      assert.equal(response.status, 503);
      const payload = await response.json();
      assert.equal(payload.error, "alpha_hunter_unavailable");
    },
  );
});

test("system actions are disabled from the dashboard adapter", async () => {
  await withFakeAlphaServer(async (alphaUrl) => {
    await withDashboardServer(
      {
        ALPHA_HUNTER_API_URL: alphaUrl,
        ALPHA_HUNTER_API_TOKEN: "adapter-token",
      },
      async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/system/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run_hourly_scan" }),
        });
        assert.equal(response.status, 403);
        const payload = await response.json();
        assert.equal(payload.success, false);
        assert.match(payload.message, /disabled/i);
      },
    );
  });
});
