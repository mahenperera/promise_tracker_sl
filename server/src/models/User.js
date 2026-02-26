import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: uuidv4 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "citizen"], required: true },
});

UserSchema.set("toJSON", { virtuals: true });

export default mongoose.model("User", UserSchema);
