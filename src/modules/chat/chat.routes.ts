import { Router } from "express";
import { getHistory, lookupConversation } from "./chat.service.js";
import { UUID_REGEX, ULID_REGEX } from "../../shared/validators.js";
import { requireAuth } from "../auth/auth.middleware.js";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const router = Router();
router.use(requireAuth);

router.get("/lookup", async (req, res) => {
  const userId: string = res.locals.userId;
  const otherId = req.query.with;

  if (typeof otherId !== "string" || !UUID_REGEX.test(otherId)) {
    res.status(400).json({ error: "with must be a valid id" });
    return;
  }
  const conversationId = await lookupConversation(userId, otherId);
  res.json({ conversationId });
});


router.get("/:id/messages", async (req, res) => {
  const conversationId = req.params.id;
  const userId = res.locals.userId;

  if (!UUID_REGEX.test(conversationId)) {
    res.status(400).json({ error: "invalid conversation id" });
    return;
  }


  let limit = DEFAULT_LIMIT;
  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      res.status(400).json({ error: `limit must be between 1 and ${MAX_LIMIT}` });
      return;
    }
  }

  let before: string | null = null;
  if (req.query.before !== undefined) {
    const raw = req.query.before;
    if (typeof raw !== "string" || !ULID_REGEX.test(raw.toUpperCase())) {
      res.status(400).json({ error: "invalid before cursor" });
      return;
    }
    before = raw.toUpperCase();
  }

  const result = await getHistory(
    userId.toLowerCase(),
    conversationId.toLowerCase(),
    limit,
    before
  );

  if (result === null) {
    res.status(403).json({ error: "not allowed" });
    return;
  }

  const { messages, hasMore } = result;
  const nextCursor = hasMore ? messages[messages.length - 1].id : null;
  res.json({ messages, nextCursor });
});

export default router;