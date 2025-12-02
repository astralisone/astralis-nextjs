/**
 * Server-only imports barrel
 *
 * Heavy dependencies that should NEVER be bundled to client.
 * Import from this file instead of directly from packages.
 *
 * This uses Next.js 'server-only' package to ensure these
 * are never accidentally imported in client components.
 */
import 'server-only';

// Google APIs - 193MB package, calendar/drive integration
export { google } from 'googleapis';
export type { calendar_v3, drive_v3 } from 'googleapis';

// Tesseract.js - 29MB OCR processing, worker-only
export { createWorker } from 'tesseract.js';
export type { Worker as TesseractWorker } from 'tesseract.js';

// PDF Parse - 29MB document processing
// @ts-ignore - pdf-parse has no type declarations
export { default as pdfParse } from 'pdf-parse';
