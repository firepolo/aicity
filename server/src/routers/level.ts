import authMiddleware from "@/middlewares/auth";
import { Router } from 'express'

const router = Router();

router.get("/generate", authMiddleware, (_req, _res) => {
});

router.get("/test", authMiddleware, (_req, _res) => {
});

export default router;