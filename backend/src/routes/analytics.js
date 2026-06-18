import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/", getAnalytics);
export default router;
