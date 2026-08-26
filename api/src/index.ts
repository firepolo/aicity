import levelRouter from "@/routers/level";
import express from "express";
import type { Request, Response } from "express";

const app = express();

app.use(express.json())
app.use(express.static("public"))

app.use("/level", levelRouter);

app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy" });
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});