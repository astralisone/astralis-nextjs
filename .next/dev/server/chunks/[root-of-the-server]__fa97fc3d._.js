module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/lib/validators/auth.validators.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loginSchema",
    ()=>loginSchema,
    "resetPasswordRequestSchema",
    ()=>resetPasswordRequestSchema,
    "resetPasswordSchema",
    ()=>resetPasswordSchema,
    "signUpSchema",
    ()=>signUpSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const signUpSchema = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email address"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain uppercase letter").regex(/[a-z]/, "Password must contain lowercase letter").regex(/[0-9]/, "Password must contain number"),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "Name must be at least 2 characters").max(100),
    orgName: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, "Organization name required").max(100)
});
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email address"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Password is required")
});
const resetPasswordRequestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email address")
});
const resetPasswordSchema = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    token: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Token is required"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain uppercase letter").regex(/[a-z]/, "Password must contain lowercase letter").regex(/[0-9]/, "Password must contain number")
});
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/lib/utils/crypto.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateToken",
    ()=>generateToken,
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/lib/email.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCustomerConfirmationEmail",
    ()=>generateCustomerConfirmationEmail,
    "generateCustomerConfirmationText",
    ()=>generateCustomerConfirmationText,
    "generateInternalNotificationEmail",
    ()=>generateInternalNotificationEmail,
    "sendEmail",
    ()=>sendEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/nodemailer/lib/nodemailer.js [app-route] (ecmascript)");
;
/**
 * Create nodemailer transporter
 * Configure SMTP settings in environment variables
 */ function createTransporter() {
    const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$nodemailer$2f$lib$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport(smtpConfig);
}
async function sendEmail(options) {
    const transporter = createTransporter();
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Astralis'}" <${process.env.SMTP_FROM_EMAIL || 'support@astralisone.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
    };
    await transporter.sendMail(mailOptions);
}
function generateCustomerConfirmationEmail(booking) {
    const meetingTypeLabel = {
        VIDEO_CALL: 'Video Call',
        PHONE_CALL: 'Phone Call',
        IN_PERSON: 'In-Person Meeting'
    }[booking.meetingType] || booking.meetingType;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1B2B 0%, #1a3a52 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Your consultation is confirmed!</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 30px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hi ${booking.name},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for scheduling a consultation with us! We're excited to discuss your automation needs and explore how Astralis can help transform your operations.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Meeting Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Booking ID:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.bookingId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">30 minutes</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">What happens next?</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                  <li>We'll send you a calendar invite (attached to this email)</li>
                  <li>A confirmation email will be sent to your calendar</li>
                  ${booking.meetingType === 'VIDEO_CALL' ? '<li>You\'ll receive a video call link 1 hour before the meeting</li>' : ''}
                  ${booking.meetingType === 'PHONE_CALL' ? '<li>We\'ll call you at ' + booking.phone + ' at the scheduled time</li>' : ''}
                  <li>Feel free to prepare any questions or materials you'd like to discuss</li>
                </ul>
              </div>

              <!-- Need to Reschedule -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Need to reschedule?</strong><br>
                  Contact us at <a href="mailto:support@astralisone.com" style="color: #f59e0b; text-decoration: none;">support@astralisone.com</a>
                  or call <a href="tel:+13412234433" style="color: #f59e0b; text-decoration: none;">+1 (341) 223-4433</a>
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                We look forward to speaking with you!
              </p>
              <p style="margin: 10px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong>ASTRALIS</strong>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <a href="mailto:support@astralisone.com" style="color: #3b82f6; text-decoration: none;">support@astralisone.com</a> |
                <a href="tel:+13412234433" style="color: #3b82f6; text-decoration: none;">+1 (341) 223-4433</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
function generateCustomerConfirmationText(booking) {
    const meetingTypeLabel = {
        VIDEO_CALL: 'Video Call',
        PHONE_CALL: 'Phone Call',
        IN_PERSON: 'In-Person Meeting'
    }[booking.meetingType] || booking.meetingType;
    return `
ASTRALIS - Your consultation is confirmed!

Hi ${booking.name},

Thank you for scheduling a consultation with us! We're excited to discuss your automation needs.

MEETING DETAILS
----------------
Booking ID: ${booking.bookingId}
Date: ${booking.date}
Time: ${booking.time}
Duration: 30 minutes
Meeting Type: ${meetingTypeLabel}

WHAT HAPPENS NEXT?
-------------------
- We'll send you a calendar invite (attached to this email)
- A confirmation will be sent to your calendar
${booking.meetingType === 'VIDEO_CALL' ? '- You\'ll receive a video call link 1 hour before the meeting' : ''}
${booking.meetingType === 'PHONE_CALL' ? '- We\'ll call you at ' + booking.phone + ' at the scheduled time' : ''}
- Feel free to prepare any questions or materials you'd like to discuss

NEED TO RESCHEDULE?
-------------------
Contact us at support@astralisone.com or call +1 (341) 223-4433

We look forward to speaking with you!

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com | +1 (341) 223-4433
  `.trim();
}
function generateInternalNotificationEmail(booking) {
    const meetingTypeLabel = {
        VIDEO_CALL: 'Video Call',
        PHONE_CALL: 'Phone Call',
        IN_PERSON: 'In-Person Meeting'
    }[booking.meetingType] || booking.meetingType;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🔔 New Consultation Booking</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px;">Booking ID: ${booking.bookingId}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 20px;">Client Information</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%;">Name:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="mailto:${booking.email}" style="color: #3b82f6; text-decoration: none;">${booking.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="tel:${booking.phone}" style="color: #3b82f6; text-decoration: none;">${booking.phone}</a>
                        </td>
                      </tr>
                      ${booking.company ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Company:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.company}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 20px; color: #0A1B2B; font-size: 20px;">Meeting Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600; width: 40%;">Date:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${booking.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${booking.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">30 minutes</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${booking.message ? `
              <h2 style="margin: 30px 0 15px; color: #0A1B2B; font-size: 20px;">Discussion Topics</h2>
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${booking.message}</p>
              </div>
              ` : ''}

              <!-- Action Items -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 10px; color: #166534; font-size: 16px;">Action Required</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  <li>Add this consultation to your calendar (ICS file attached)</li>
                  <li>Review client information and discussion topics</li>
                  ${booking.meetingType === 'VIDEO_CALL' ? '<li>Prepare video call link and send 1 hour before meeting</li>' : ''}
                  ${booking.meetingType === 'PHONE_CALL' ? '<li>Ensure you have the client\'s phone number ready</li>' : ''}
                  <li>Prepare any relevant materials or questions</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated notification from the Astralis booking system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
}),
"[project]/projects/astralis-nextjs/src/lib/utils/email-templates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail,
    "sendVerificationEmail",
    ()=>sendVerificationEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/email.ts [app-route] (ecmascript)");
;
const BASE_URL = ("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3001';
async function sendVerificationEmail(email, token) {
    const verifyUrl = `${BASE_URL}/auth/verify-email?token=${token}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Verify Your Email - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Verify Your Email Address</h2>

        <p>Thank you for signing up for AstralisOps! Please verify your email address by clicking the button below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verifyUrl}" style="color: #2B6CB0; word-break: break-all;">${verifyUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This verification link will expire in 24 hours.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't create an account with AstralisOps, you can safely ignore this email.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
    const text = `
    Verify Your Email Address

    Thank you for signing up for AstralisOps!

    Please verify your email address by visiting this link:
    ${verifyUrl}

    This verification link will expire in 24 hours.

    If you didn't create an account with AstralisOps, you can safely ignore this email.
  `;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendEmail"])({
        to: email,
        subject: 'Verify Your Email - AstralisOps',
        html,
        text
    });
}
async function sendPasswordResetEmail(email, token) {
    const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password - AstralisOps</title>
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #0A1B2B; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2B6CB0; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AstralisOps</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A1B2B; margin-top: 0;">Reset Your Password</h2>

        <p>We received a request to reset your password. Click the button below to set a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2B6CB0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>

        <p style="color: #718096; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2B6CB0; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          This password reset link will expire in 1 hour.
        </p>

        <p style="color: #718096; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </div>

      <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096;">
        <p>© 2025 Astralis. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
    const text = `
    Reset Your Password

    We received a request to reset your password.

    Visit this link to set a new password:
    ${resetUrl}

    This password reset link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.
  `;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$email$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendEmail"])({
        to: email,
        subject: 'Reset Your Password - AstralisOps',
        html,
        text
    });
}
}),
"[project]/projects/astralis-nextjs/src/lib/services/auth.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthService",
    ()=>AuthService,
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/crypto.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$email$2d$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/utils/email-templates.ts [app-route] (ecmascript)");
;
;
;
;
class AuthService {
    /**
   * Register new user with organization
   */ async signUp(data) {
        const { email, password, name, orgName } = data;
        // Check if user already exists
        const existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(password);
        // Generate verification token
        const verificationToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateToken"])();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create organization and user in transaction
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Create organization
            const org = await tx.organization.create({
                data: {
                    name: orgName
                }
            });
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'ADMIN',
                    orgId: org.id,
                    isActive: true
                }
            });
            // Create verification token
            await tx.verificationToken.create({
                data: {
                    identifier: email,
                    token: verificationToken,
                    expires: tokenExpiry
                }
            });
            // Log account creation
            await tx.activityLog.create({
                data: {
                    userId: user.id,
                    orgId: org.id,
                    action: 'CREATE',
                    entity: 'USER',
                    entityId: user.id,
                    metadata: {
                        email,
                        name,
                        source: 'SIGNUP'
                    }
                }
            });
            return {
                user,
                org,
                verificationToken
            };
        });
        // Send verification email
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$email$2d$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendVerificationEmail"])(email, verificationToken);
        return {
            success: true,
            message: 'Account created. Please check your email to verify your account.',
            userId: result.user.id
        };
    }
    /**
   * Verify email address
   */ async verifyEmail(token) {
        const verificationToken = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationToken.findUnique({
            where: {
                token
            }
        });
        if (!verificationToken) {
            throw new Error('Invalid or expired verification token');
        }
        if (new Date() > verificationToken.expires) {
            throw new Error('Verification token has expired');
        }
        // Update user email verification
        await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                email: verificationToken.identifier
            },
            data: {
                emailVerified: new Date()
            }
        });
        // Delete used token
        await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationToken.delete({
            where: {
                token
            }
        });
        return {
            success: true,
            message: 'Email verified successfully'
        };
    }
    /**
   * Request password reset
   */ async requestPasswordReset(email) {
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            // Don't reveal if email exists
            return {
                success: true,
                message: 'If an account exists, a password reset link has been sent.'
            };
        }
        // Generate reset token
        const resetToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateToken"])();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Store reset token
        await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationToken.create({
            data: {
                identifier: email,
                token: resetToken,
                expires: tokenExpiry
            }
        });
        // Send reset email
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$email$2d$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(email, resetToken);
        return {
            success: true,
            message: 'If an account exists, a password reset link has been sent.'
        };
    }
    /**
   * Reset password with token
   */ async resetPassword(token, newPassword) {
        const verificationToken = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationToken.findUnique({
            where: {
                token
            }
        });
        if (!verificationToken) {
            throw new Error('Invalid or expired reset token');
        }
        if (new Date() > verificationToken.expires) {
            throw new Error('Reset token has expired');
        }
        // Hash new password
        const hashedPassword = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$utils$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(newPassword);
        // Update user password
        await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
            where: {
                email: verificationToken.identifier
            },
            data: {
                password: hashedPassword
            }
        });
        // Delete used token
        await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationToken.delete({
            where: {
                token
            }
        });
        return {
            success: true,
            message: 'Password reset successfully'
        };
    }
}
const authService = new AuthService();
}),
"[project]/projects/astralis-nextjs/src/app/api/auth/signup/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$validators$2f$auth$2e$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/validators/auth.validators.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/src/lib/services/auth.service.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const body = await req.json();
        // Validate input
        const validatedData = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$validators$2f$auth$2e$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signUpSchema"].parse(body);
        // Create account
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$src$2f$lib$2f$services$2f$auth$2e$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authService"].signUp(validatedData);
        return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
            status: 201
        });
    } catch (error) {
        console.error('Sign up error:', error);
        if (error instanceof Error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.message
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fa97fc3d._.js.map