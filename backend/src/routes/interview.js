import { Router } from "express";
import { getAll, create, update, toggle, remove } from "../controllers/interview.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/toggle", toggle);
router.delete("/:id", remove);
export default router;
