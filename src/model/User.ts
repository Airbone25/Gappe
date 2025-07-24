import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: String,
  gender: String,
  dob: Date,
});

export const User = models.User || model("User", UserSchema);
