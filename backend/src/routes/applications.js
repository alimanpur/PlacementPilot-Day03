import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/applications.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
