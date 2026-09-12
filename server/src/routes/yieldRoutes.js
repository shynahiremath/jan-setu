import express from "express";
import { estimateYieldHandler } from "../controllers/yieldController.js";

const router = express.Router();

router.post("/estimate", estimateYieldHandler);

export default router;