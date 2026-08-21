import { tokens } from "@/shared/data";
import { randomString } from "@/helpers/random";
import type { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['uid'] || !req.headers['token']) return res.status(400).json({});
    const uid: any = req.headers['uid'];
    const token: any = req.headers['token'];
    if (tokens.get(uid) != token) return res.status(400).json({});
	const newToken: string = randomString(128);
	tokens.set(uid, newToken);
    res.setHeader('token', newToken);
    next();
};