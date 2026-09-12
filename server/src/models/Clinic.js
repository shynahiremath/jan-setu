import mongoose from "mongoose";
const { Schema } = mongoose;

const clinicSchema = new Schema({
  name: { type: String, required: true },
  village: String,
  district: String,
  location: {
    lat: Number,
    lng: Number,
  },
  contactPhone: String,
  govCertified: { type: Boolean, default: false },
  resources: [String], // e.g. ["BP monitor", "oxygen", "ambulance"]
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Clinic", clinicSchema);