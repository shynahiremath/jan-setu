import express from "express";
import { checkSymptoms, seasonalTips } from "../controllers/aiController.js";
const router = express.Router();

router.post("/symptom-check", checkSymptoms);
router.post("/seasonal-tips", seasonalTips);

export default router;