import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireHealthRole } from "../middleware/requireHealthRole.js";
import { registerPatient, getPatients, getPatientById } from "../controllers/patientController.js";
const router = express.Router();

router.post("/", protect, requireHealthRole("asha", "doctor"), registerPatient);
router.get("/", protect, getPatients);
router.get("/:id", protect, getPatientById);

export default router;