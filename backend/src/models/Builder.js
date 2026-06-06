const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const builderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  companyName: { type: String, trim: true },
  passwordHash: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

builderSchema.virtual('password').set(function setPassword(password) {
  this._password = password;
});

builderSchema.pre('validate', async function hashPassword(next) {
  if (!this._password) return next();
  this.passwordHash = await bcrypt.hash(this._password, 12);
  next();
});

builderSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Builder', builderSchema);
