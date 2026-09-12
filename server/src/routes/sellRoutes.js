import express from "express";
import { optimizeSellHandler } from "../controllers/sellController.js";

const router = express.Router();

router.post("/optimize", optimizeSellHandler);

export default router;