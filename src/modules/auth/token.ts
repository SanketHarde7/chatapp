import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const EXPIRES_IN = "1h";

export function signToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}