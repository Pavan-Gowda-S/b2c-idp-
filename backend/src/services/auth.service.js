const bcrypt = require('bcryptjs');
const { getSupabase } = require('../supabase/client');
const store = require('./supabase.service');
const collections = require('../supabase/tables');

const OTP_LIFETIME_MS = 5 * 60 * 1000;
const otpStore = new Map();

function normalizePhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '').slice(-10);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function findUserByEmail(email) {
  if (!email) return null;
  return store.findOne(collections.users, 'email', '==', email.toLowerCase());
}

async function findUserByPhone(phone) {
  const cleanPhone = normalizePhone(phone);
  return store.findOne(collections.users, 'phone_number', '==', cleanPhone);
}

async function createBuilder({ name, email, phone, password }) {
  const lowerEmail = email ? String(email).toLowerCase() : '';
  const cleanPhone = normalizePhone(phone);
  if (lowerEmail) {
    const existingEmail = await findUserByEmail(lowerEmail);
    if (existingEmail) throw new Error('Email already registered');
  }
  if (cleanPhone) {
    const existingPhone = await findUserByPhone(cleanPhone);
    if (existingPhone) throw new Error('Phone number already registered');
  }
  const user = await store.create(collections.users, {
    name,
    email: lowerEmail,
    phone_number: cleanPhone,
    role: 'BUILDER',
    password_hash: await hashPassword(password)
  });
  return user;
}

async function authenticateBuilder(identifier, password) {
  if (!identifier || !password) return null;
  const lookup = identifier.includes('@') ? await findUserByEmail(identifier) : await findUserByPhone(identifier);
  if (!lookup || String(lookup.role).toUpperCase() !== 'BUILDER') return null;
  const valid = await comparePassword(password, lookup.passwordHash || lookup.password_hash || '');
  return valid ? lookup : null;
}

async function googleBuilderLogin({ email, name, googleId }) {
  if (!email || !googleId) throw new Error('Google login requires email and googleId');
  const lowerEmail = email.toLowerCase();
  let user = await store.findOne(collections.users, 'google_id', '==', googleId);
  if (!user) {
    user = await findUserByEmail(lowerEmail);
  }
  if (user) {
    return store.update(collections.users, user._id, {
      name: user.name || name,
      email: lowerEmail,
      google_id: googleId,
      role: 'BUILDER'
    });
  }
  return store.create(collections.users, {
    name,
    email: lowerEmail,
    role: 'BUILDER',
    google_id: googleId
  });
}

async function requestCustomerOtp(phone) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) throw new Error('Valid phone number required');
  const user = await findUserByPhone(cleanPhone);
  if (!user || String(user.role).toUpperCase() !== 'CUSTOMER') {
    throw new Error('Customer phone not found');
  }
  const otp = generateOtp();
  const expiry = Date.now() + OTP_LIFETIME_MS;
  otpStore.set(cleanPhone, { otp, expiry, userId: user._id });
  setTimeout(() => otpStore.delete(cleanPhone), OTP_LIFETIME_MS);
  return { otp, phone: cleanPhone, user };
}

async function verifyCustomerOtp(phone, otp) {
  const cleanPhone = normalizePhone(phone);
  const record = otpStore.get(cleanPhone);
  if (!record || record.expiry < Date.now() || String(record.otp) !== String(otp)) {
    throw new Error('Invalid or expired OTP');
  }
  const user = await store.getById(collections.users, record.userId);
  if (!user || String(user.role).toUpperCase() !== 'CUSTOMER') {
    throw new Error('Invalid customer');
  }
  otpStore.delete(cleanPhone);
  return user;
}

module.exports = {
  hashPassword,
  comparePassword,
  createBuilder,
  authenticateBuilder,
  googleBuilderLogin,
  requestCustomerOtp,
  verifyCustomerOtp,
  findUserByPhone,
  normalizePhone
};
