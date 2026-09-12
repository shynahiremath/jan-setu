import mongoose from "mongoose";
const { Schema } = mongoose;

const familySchema = new Schema({
  familyName: String,
  headOfFamily: { type: Schema.Types.ObjectId, ref: "Patient" },
  village: String,
  district: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Family", familySchema);