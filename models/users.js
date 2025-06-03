
import mongoose from "mongoose";


   const userSchema = new mongoose.Schema({
   name: String,
   password: String,
   bio: String,
   profile_pic: {type: String, default: ''},
   followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
   following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
   createdAt: { type: Date, default: Date.now }
 });

const User = mongoose.model("User", userSchema);

export default User;
