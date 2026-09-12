import express from "express";
import { analyzeCrop } from "../controllers/cropController.js";

const router = express.Router();

// POST /api/crop/analyze
router.post("/analyze", analyzeCrop);

export default router;