import mongoose from "mongoose";
const { Schema } = mongoose;

const consultationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["video", "audio", "async"], default: "async" },
  symptomsText: String,
  symptomsVoiceUrl: String,
  photoUrl: String,
  aiSuggestion: String, // Gemini output
  doctorResponse: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Consultation", consultationSchema);