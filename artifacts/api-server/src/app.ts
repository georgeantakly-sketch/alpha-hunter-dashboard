import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const staticDir =
  process.env["ALPHA_HUNTER_STATIC_DIR"] ??
  path.resolve(process.cwd(), "..", "alpha-hunter", "dist", "public");
const staticIndex = path.join(staticDir, "index.html");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (existsSync(staticIndex)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    res.sendFile(staticIndex);
  });
} else {
  logger.warn(
    { staticDir },
    "Alpha Hunter dashboard static build not found; API-only mode enabled",
  );
}

export default app;
