// schema for our project  
import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is Required."],
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is Required."],
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
});

// ✅ Hash password before save (for User.create, new user.save, etc.)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if password is new/changed
  const salt = await genSalt();
  this.password = await hash(this.password, salt);
  next();
});

// ✅ Hash password before update (for User.findOneAndUpdate, etc.)
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await genSalt();
    update.password = await hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

const User = mongoose.model("Users", userSchema);

export default User;
