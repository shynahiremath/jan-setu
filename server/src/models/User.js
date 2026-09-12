import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    location: {
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      village: { type: String, default: "" }, // added for healthcare module
    },
    userType: {
      type: String,
      enum: ["citizen", "admin"],
      default: "citizen",
    },
    healthRole: {
      // added for healthcare module — doesn't touch userType
      type: String,
      enum: ["patient", "asha", "doctor"],
      default: "patient",
    },
    profile: {
      isFarmer: { type: Boolean, default: false },
      gender: { type: String, enum: ["", "male", "female", "other"], default: "" },
      hasDaughterUnder10: { type: Boolean, default: false },
      isBusinessOwner: { type: Boolean, default: false },
      hasOwnHouse: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;