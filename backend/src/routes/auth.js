import { Router } from "express";
import { register, login, me, seed, resetDemo } from "../controllers/auth.js";
import auth from "../middleware/auth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.post("/seed", seed);
router.post("/reset-demo", auth, resetDemo);
export default router;
