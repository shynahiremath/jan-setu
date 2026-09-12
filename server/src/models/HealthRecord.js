import mongoose from "mongoose";
const { Schema } = mongoose;

const healthRecordSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  vitals: {
    bp: String,
    pulse: Number,
    spo2: Number,
    temperature: Number,
    weight: Number,
  },
  symptoms: String,
  diagnosis: String,
  prescription: String,
  photoUrl: String, // Cloudinary free tier
  syncStatus: { type: String, enum: ["synced", "pending"], default: "synced" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("HealthRecord", healthRecordSchema);