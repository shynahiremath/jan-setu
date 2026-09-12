import express from "express";
import { addClinic, getClinics } from "../controllers/clinicController.js";
const router = express.Router();

router.post("/", addClinic);
router.get("/", getClinics);

export default router;