// import mongoose from 'mongoose';
// import bcrypt from "bcryptjs";

// const Schema = mongoose.Schema;

// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true
//         },
//         email: {
//             type: String,
//             required: true,
//             unique: true
//         },
//         password: {
//             type: String,
//             required: true,
//             minlength: 6
//         },
//         recipes: [
//             {
//                 type: mongoose.Types.ObjectId,
//                 ref: "Recipe",
//                 required: true
//             }
//         ],
//     });
//     export default mongoose.model("User",userSchema);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
