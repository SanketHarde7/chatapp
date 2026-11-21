import { createUser, getAuthUser, getUserById } from "../user/user.queries.js";
import { hashPassword, verifyPassword } from "./password.js";
import { signToken } from "./token.js";
import { requireAuth } from "./auth.middleware.js";
import { Router } from "express";
const router = Router();

const DUMMY_HASH = await hashPassword("dummy-password");

function readCredentials(body: unknown): { username: string; password: string } | null {
  if (typeof body !== "object" || body === null) return null;
  const { username, password } = body as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string") return null;

  const name = username.trim();
  if (name === "" || name.length > 32) return null;
  if (password.length < 8 || password.length > 128) return null;
  return { username: name, password };
}

router.post("/register", async (req, res) => {
  const creds = readCredentials(req.body);
  if (!creds) {
    res.status(400).json({ error: "username (1-32 chars) and password (8-128 chars) required" });
    return;
  }

  try {
    const user = await createUser(creds.username, await hashPassword(creds.password));
    res.status(201).json({ id: user.id, username: user.username, token: signToken(user.id) });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "username already taken" });
      return;
    }
    throw err;
  }
});

router.post("/login", async (req, res) => {
  const creds = readCredentials(req.body);
  if (!creds) {
    res.status(400).json({ error: "username and password required" });
    return;
  }

  const user = await getAuthUser(creds.username);
  const ok = await verifyPassword(creds.password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !user.password_hash || !ok) {
    res.status(401).json({ error: "invalid username or password" });
    return;
  }
  res.json({ id: user.id, username: user.username, token: signToken(user.id) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await getUserById(res.locals.userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.json({ id: user.id, username: user.username });
});

export default router;