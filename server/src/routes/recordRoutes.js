import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireHealthRole } from "../middleware/requireHealthRole.js";
import { addRecord, getRecordsByPatient, bulkSyncRecords } from "../controllers/recordController.js";
const router = express.Router();

router.post("/", protect, requireHealthRole("asha", "doctor"), addRecord);
router.post("/sync", protect, requireHealthRole("asha", "doctor"), bulkSyncRecords);
router.get("/patient/:patientId", protect, getRecordsByPatient);

export default router;