import { Router, type IRouter } from "express";
import healthRouter from "./health";
import overviewRouter from "./overview";
import tradesRouter from "./trades";
import candidatesRouter from "./candidates";
import briefsRouter from "./briefs";
import configRouter from "./config";
import systemRouter from "./system";

const router: IRouter = Router();

router.use(healthRouter);
router.use(overviewRouter);
router.use(tradesRouter);
router.use(candidatesRouter);
router.use(briefsRouter);
router.use(configRouter);
router.use(systemRouter);

export default router;
