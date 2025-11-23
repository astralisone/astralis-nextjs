"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateSecureToken = generateSecureToken;
var bcryptjs_1 = require("bcryptjs");
var crypto_1 = require("crypto");
var SALT_ROUNDS = 12;
// Encryption algorithm and settings
var ALGORITHM = 'aes-256-gcm';
var IV_LENGTH = 16;
var SALT_LENGTH = 64;
var TAG_LENGTH = 16;
var KEY_LENGTH = 32;
/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.hash(password, SALT_ROUNDS)];
        });
    });
}
/**
 * Verify password against hash
 * @param password Plain text password
 * @param hash Stored password hash
 * @returns True if password matches
 */
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.compare(password, hash)];
        });
    });
}
/**
 * Generate random token for email verification
 * @returns Random token string
 */
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
/**
 * Get encryption key from environment
 * Uses N8N_ENCRYPTION_KEY or generates one if not set
 */
function getEncryptionKey() {
    var key = process.env.N8N_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
    if (!key) {
        throw new Error('Encryption key not found in environment variables');
    }
    // Derive a 32-byte key from the provided key using PBKDF2
    return crypto_1.default.pbkdf2Sync(key, 'astralis-salt', 100000, KEY_LENGTH, 'sha256');
}
/**
 * Encrypt sensitive data (e.g., API keys, OAuth tokens)
 * @param text Plain text to encrypt
 * @returns Encrypted string with IV, salt, and auth tag
 */
function encrypt(text) {
    try {
        var iv = crypto_1.default.randomBytes(IV_LENGTH);
        var salt = crypto_1.default.randomBytes(SALT_LENGTH);
        var key = getEncryptionKey();
        var cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
        var encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        var authTag = cipher.getAuthTag();
        // Combine salt + iv + authTag + encrypted data
        var result = salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
        return result;
    }
    catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}
/**
 * Decrypt sensitive data
 * @param encryptedText Encrypted string with IV, salt, and auth tag
 * @returns Decrypted plain text
 */
function decrypt(encryptedText) {
    try {
        var parts = encryptedText.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        var salt = Buffer.from(parts[0], 'hex');
        var iv = Buffer.from(parts[1], 'hex');
        var authTag = Buffer.from(parts[2], 'hex');
        var encrypted = parts[3];
        var key = getEncryptionKey();
        var decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}
/**
 * Generate a secure random string
 * @param length Length of the random string (default: 32)
 * @returns Random hex string
 */
function generateSecureToken(length) {
    if (length === void 0) { length = 32; }
    return crypto_1.default.randomBytes(length).toString('hex');
}
