import { Router } from "express";
import { getUserById, listUsers } from "./user.queries.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { UUID_REGEX } from "../../shared/validators.js";
const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const users = await listUsers();
  res.json(users);
});



router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ error: "invalid user id" });
    return;
  }

  const user = await getUserById(id);
  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  res.json(user);
});

export default router;