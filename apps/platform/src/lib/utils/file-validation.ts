import { fileTypeFromBuffer } from 'file-type';

/**
 * File Validation Utilities
 *
 * Handles file type validation, size limits, and MIME type checking
 * for secure file uploads to DigitalOcean Spaces.
 */

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',

  // PDFs
  'application/pdf',

  // Microsoft Office
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // Text
  'text/plain',
  'text/csv',
] as const;

/**
 * Maximum file size in bytes (50MB default)
 */
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB

/**
 * File extension to MIME type mapping
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',

  // PDFs
  'pdf': 'application/pdf',

  // Microsoft Office
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text
  'txt': 'text/plain',
  'csv': 'text/csv',
};

/**
 * Validation result interface
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
  fileSize?: number;
}

/**
 * Validate file size
 *
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns Validation result
 */
export function validateFileSize(fileSize: number, maxSize: number = MAX_FILE_SIZE): FileValidationResult {
  if (fileSize <= 0) {
    return {
      valid: false,
      error: 'File is empty',
      fileSize,
    };
  }

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      fileSize,
    };
  }

  return {
    valid: true,
    fileSize,
  };
}

/**
 * Validate MIME type against allowed types
 *
 * @param mimeType - MIME type to validate
 * @returns Validation result
 */
export function validateMimeType(mimeType: string): FileValidationResult {
  const normalizedMimeType = mimeType.toLowerCase().trim();

  if (!ALLOWED_MIME_TYPES.includes(normalizedMimeType as any)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Allowed types: images, PDFs, Office documents`,
      detectedMimeType: normalizedMimeType,
    };
  }

  return {
    valid: true,
    detectedMimeType: normalizedMimeType,
  };
}

/**
 * Detect MIME type from file buffer using magic numbers
 *
 * @param buffer - File buffer
 * @returns Detected MIME type or null
 */
export async function detectMimeType(buffer: Buffer): Promise<string | null> {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType?.mime || null;
  } catch (error) {
    console.error('Error detecting MIME type:', error);
    return null;
  }
}

/**
 * Get MIME type from file extension
 *
 * @param filename - Filename with extension
 * @returns MIME type or null
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? (EXTENSION_TO_MIME[ext] || null) : null;
}

/**
 * Comprehensive file validation
 *
 * Validates file size, MIME type (from extension and buffer), and security checks.
 *
 * @param file - File buffer
 * @param filename - Original filename
 * @param declaredMimeType - MIME type declared by client
 * @returns Validation result with detected MIME type
 */
export async function validateFile(
  file: Buffer,
  filename: string,
  declaredMimeType: string
): Promise<FileValidationResult> {
  // 1. Validate file size
  const sizeValidation = validateFileSize(file.length);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // 2. Validate declared MIME type
  const declaredMimeValidation = validateMimeType(declaredMimeType);
  if (!declaredMimeValidation.valid) {
    return declaredMimeValidation;
  }

  // 3. Detect actual MIME type from buffer (magic numbers)
  const detectedMimeType = await detectMimeType(file);

  // 4. Get MIME type from extension
  const extensionMimeType = getMimeTypeFromExtension(filename);

  // 5. Cross-validate MIME types for security
  // We check if detected type matches declared type or extension type
  if (detectedMimeType) {
    // If we detected a type, it must be allowed
    const detectedValidation = validateMimeType(detectedMimeType);
    if (!detectedValidation.valid) {
      return {
        valid: false,
        error: `Detected file type '${detectedMimeType}' is not allowed (declared as '${declaredMimeType}')`,
        detectedMimeType,
      };
    }

    // Verify declared type matches detected type (with some flexibility)
    if (!mimeTypesMatch(declaredMimeType, detectedMimeType)) {
      return {
        valid: false,
        error: `File type mismatch: declared '${declaredMimeType}' but detected '${detectedMimeType}'`,
        detectedMimeType,
      };
    }
  } else if (extensionMimeType) {
    // If we can't detect type from buffer, fall back to extension
    // This handles cases like Office documents which may not have magic numbers
    const extensionValidation = validateMimeType(extensionMimeType);
    if (!extensionValidation.valid) {
      return extensionValidation;
    }
  } else {
    // Can't determine type at all
    return {
      valid: false,
      error: `Unable to determine file type for '${filename}'`,
    };
  }

  // 6. Additional security checks
  const securityCheck = performSecurityChecks(file, filename);
  if (!securityCheck.valid) {
    return securityCheck;
  }

  return {
    valid: true,
    detectedMimeType: detectedMimeType || extensionMimeType || declaredMimeType,
    fileSize: file.length,
  };
}

/**
 * Check if two MIME types match (with flexibility for variants)
 *
 * @param declared - Declared MIME type
 * @param detected - Detected MIME type
 * @returns True if types match or are compatible
 */
function mimeTypesMatch(declared: string, detected: string): boolean {
  const normalizedDeclared = declared.toLowerCase().trim();
  const normalizedDetected = detected.toLowerCase().trim();

  // Exact match
  if (normalizedDeclared === normalizedDetected) {
    return true;
  }

  // Handle JPEG variants
  if (
    (normalizedDeclared === 'image/jpeg' && normalizedDetected === 'image/jpg') ||
    (normalizedDeclared === 'image/jpg' && normalizedDetected === 'image/jpeg')
  ) {
    return true;
  }

  // Handle TIFF variants
  if (
    (normalizedDeclared === 'image/tiff' && normalizedDetected === 'image/tif') ||
    (normalizedDeclared === 'image/tif' && normalizedDetected === 'image/tiff')
  ) {
    return true;
  }

  return false;
}

/**
 * Perform basic security checks on file
 *
 * @param file - File buffer
 * @param filename - Original filename
 * @returns Validation result
 */
function performSecurityChecks(file: Buffer, filename: string): FileValidationResult {
  // Check for null bytes (potential security issue)
  if (file.includes(0x00) && !filename.toLowerCase().endsWith('.pdf')) {
    // PDFs can have null bytes, others shouldn't in text content
    // This is a basic check; more sophisticated scanning would be needed for production
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid Windows filename characters
    /^\./, // Hidden files
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(filename)) {
      return {
        valid: false,
        error: `Filename contains invalid or suspicious characters: '${filename}'`,
      };
    }
  }

  return { valid: true };
}

/**
 * Format file size for human-readable display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if file is an image
 *
 * @param mimeType - MIME type to check
 * @returns True if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 *
 * @param mimeType - MIME type to check
 * @returns True if file is a PDF
 */
export function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if file supports OCR processing
 *
 * @param mimeType - MIME type to check
 * @returns True if file can be processed with OCR
 */
export function supportsOCR(mimeType: string): boolean {
  return isImage(mimeType) || isPDF(mimeType);
}
