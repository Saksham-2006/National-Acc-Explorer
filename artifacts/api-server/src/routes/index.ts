import { Router, type IRouter } from "express";
import healthRouter from "./health";
import economicRouter from "./economic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(economicRouter);

export default router;
