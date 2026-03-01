const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: [true, 'First name is required'], trim: true },
    lastName:     { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // Never stored as plain text — always bcrypt-hashed before save
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
