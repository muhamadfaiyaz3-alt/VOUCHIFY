import "dotenv/config";

const numberFromEnv = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const Env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: (process.env.NODE_ENV ?? "development") !== "production",
  port: numberFromEnv(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "mongodb+srv://root:12345@cluster1.hhqtg3p.mongodb.net/vouchify",
  frontendUrl: process.env.FRONTEND_URL || "https://smart-voucher-exchange-platform.vercel.app",
  defaultCurrency: process.env.DEFAULT_CURRENCY || "INR",

  // Auth
  jwtSecret: process.env.JWT_SECRET || "dev_secret_key_change_in_prod",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // Payments
  paymentsEnabled: (process.env.PAYMENTS_ENABLED || "false").toLowerCase() === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",

  // Fees
  platformFeePercent: numberFromEnv(process.env.PLATFORM_FEE_PERCENT, 0.15),
  companySharePercent: numberFromEnv(process.env.COMPANY_SHARE_PERCENT, 0.05),

  // Security
  encryptionKey: process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",

  // Firebase (Legacy/Optional)
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  firebaseDisabled: (process.env.FIREBASE_DISABLED || "").toLowerCase() === "true",

  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: numberFromEnv(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "noreply@vouchify.com",
  smtpFromName: process.env.SMTP_FROM_NAME || "Vouchify Support",
};

export default Env;
