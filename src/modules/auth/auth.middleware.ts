import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./token.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token ? verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  res.locals.userId = userId;
  next();
}