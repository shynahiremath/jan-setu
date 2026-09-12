import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // null if registered by ASHA without login
  familyId: { type: Schema.Types.ObjectId, ref: "Family" },
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  phone: String,
  village: String,
  district: String,
  registeredBy: { type: Schema.Types.ObjectId, ref: "User" }, // ASHA worker who registered them
  qrCode: String, // generated unique patient code
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Patient", patientSchema);