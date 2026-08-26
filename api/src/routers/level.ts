import authMiddleware from "@/middlewares/auth";
import { Router } from 'express'

const router = Router();

router.get("/generate", authMiddleware, (req, res) => {
});

router.get("/test", authMiddleware, (req, res) => {
});

export default router;