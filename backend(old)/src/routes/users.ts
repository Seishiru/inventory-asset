// backend/src/routes/users.ts
import { Router } from "express";
import * as UserController from "../controllers/userController";

const router = Router();

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.patch("/:id/status", UserController.updateUserStatus);

export default router;