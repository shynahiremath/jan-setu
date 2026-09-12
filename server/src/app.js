import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import schemesRoutes from "./routes/schemesRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import mandiRoutes from "./routes/mandiRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import sellRoutes from "./routes/sellRoutes.js";
import yieldRoutes from "./routes/yieldRoutes.js";

// Healthcare module
import patientRoutes from "./routes/patientRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/api/server-status", (req, res) => {
  res.json({ status: "ok", message: "Jan Setu backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/schemes", schemesRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/mandi-prices", mandiRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/yield", yieldRoutes);

app.use("/api/patients", patientRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/clinics", clinicRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });