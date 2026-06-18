import { Router } from "express";
import { getAll, create, toggle, remove, getStats } from "../controllers/dsa.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/", getAll);
router.get("/stats", getStats);
router.post("/", create);
router.patch("/:id/toggle", toggle);
router.delete("/:id", remove);
export default router;
