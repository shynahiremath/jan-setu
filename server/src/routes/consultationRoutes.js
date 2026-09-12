import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireHealthRole } from "../middleware/requireHealthRole.js";
import {
  createConsultation,
  getConsultations,
  respondToConsultation,
} from "../controllers/consultationController.js";
const router = express.Router();

router.post("/", createConsultation); // open — patient may not have an account yet
router.get("/", protect, requireHealthRole("doctor"), getConsultations);
router.put("/:id/respond", protect, requireHealthRole("doctor"), respondToConsultation);

export default router;