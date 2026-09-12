import mongoose from "mongoose";
const { Schema } = mongoose;

const alertSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["outbreak", "vaccination", "seasonal", "general"],
    default: "general",
  },
  village: String,
  district: String,
  severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Alert", alertSchema);