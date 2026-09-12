import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireHealthRole } from "../middleware/requireHealthRole.js";
import { createAlert, getAlerts } from "../controllers/alertController.js";
const router = express.Router();

router.post("/", protect, requireHealthRole("asha", "doctor"), createAlert);
router.get("/", getAlerts); // public — anyone can view alerts, no login needed

export default router;