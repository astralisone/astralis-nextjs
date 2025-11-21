import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * OCR Service
 *
 * Handles text extraction from images and PDFs using Tesseract.js.
 *
 * Features:
 * - Extract text from images (JPEG, PNG, etc.)
 * - Process PDFs page by page
 * - Image preprocessing for better OCR accuracy
 * - Confidence scores for extracted text
 * - Multiple language support
 */

/**
 * OCR result interface
 */
export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
  processingTime: number;
}

/**
 * OCR preprocessing options
 */
export interface OCRPreprocessingOptions {
  // Enhance contrast for better OCR
  enhanceContrast?: boolean;
  // Convert to grayscale
  grayscale?: boolean;
  // Apply sharpening
  sharpen?: boolean;
  // Resize for optimal OCR (default: true)
  resize?: boolean;
  // Target width for resizing (default: 2000px)
  targetWidth?: number;
}

/**
 * OCR Service class
 */
export class OCRService {
  private defaultLanguage: string = 'eng';
  private defaultPreprocessing: OCRPreprocessingOptions = {
    enhanceContrast: true,
    grayscale: true,
    sharpen: true,
    resize: true,
    targetWidth: 2000,
  };

  /**
   * Preprocess image for better OCR accuracy
   *
   * @param imageBuffer - Original image buffer
   * @param options - Preprocessing options
   * @returns Preprocessed image buffer
   */
  private async preprocessImage(
    imageBuffer: Buffer,
    options: OCRPreprocessingOptions = {}
  ): Promise<Buffer> {
    try {
      const opts = { ...this.defaultPreprocessing, ...options };
      let image = sharp(imageBuffer);

      // Get image metadata
      const metadata = await image.metadata();
      const width = metadata.width || 0;

      // Resize if image is too large or too small
      if (opts.resize && opts.targetWidth) {
        if (width > opts.targetWidth || width < 800) {
          image = image.resize(opts.targetWidth, null, {
            fit: 'inside',
            withoutEnlargement: false,
          });
        }
      }

      // Convert to grayscale
      if (opts.grayscale) {
        image = image.grayscale();
      }

      // Enhance contrast
      if (opts.enhanceContrast) {
        image = image.normalize();
      }

      // Apply sharpening
      if (opts.sharpen) {
        image = image.sharpen();
      }

      // Convert to PNG for consistent processing
      return await image.png().toBuffer();
    } catch (error) {
      console.error('Image preprocessing error:', error);
      // If preprocessing fails, return original buffer
      return imageBuffer;
    }
  }

  /**
   * Extract text from image using Tesseract OCR
   *
   * @param imageBuffer - Image buffer (JPEG, PNG, etc.)
   * @param language - OCR language (default: 'eng')
   * @param preprocessing - Preprocessing options
   * @returns OCR result with extracted text and confidence
   */
  async extractTextFromImage(
    imageBuffer: Buffer,
    language: string = this.defaultLanguage,
    preprocessing: OCRPreprocessingOptions = {}
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Preprocess image
      const preprocessedBuffer = await this.preprocessImage(imageBuffer, preprocessing);

      // Perform OCR
      const result = await Tesseract.recognize(preprocessedBuffer, language, {
        logger: (info) => {
          // Log progress for debugging (can be removed in production)
          if (info.status === 'recognizing text') {
            console.log(`OCR progress: ${Math.round(info.progress * 100)}%`);
          }
        },
      });

      const processingTime = Date.now() - startTime;

      // Log result structure for debugging
      console.log(`[OCR] Result structure:`, {
        hasData: !!result.data,
        hasText: !!result.data?.text,
        hasConfidence: !!result.data?.confidence,
        textLength: result.data?.text?.length || 0,
      });

      // Extract text and confidence
      const text = result.data.text.trim();
      const confidence = result.data.confidence / 100; // Convert to 0-1 scale
      const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length;

      console.log(`[OCR] Extracted: ${text.length} chars, ${wordCount} words, ${(confidence * 100).toFixed(1)}% confidence`);

      return {
        text,
        confidence,
        language,
        wordCount,
        processingTime,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF
   *
   * Uses pdf-parse to extract embedded text from PDFs.
   * For scanned PDFs without text, consider implementing
   * image-based OCR using pdf2pic or similar.
   *
   * @param pdfBuffer - PDF buffer
   * @param language - OCR language (default: 'eng')
   * @returns OCR result with extracted text
   */
  async extractTextFromPDF(
    pdfBuffer: Buffer,
    language: string = this.defaultLanguage
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Dynamic import pdf-parse only when needed (worker context)
      // pdf-parse has both default and named exports depending on version
      const pdfParseModule = require('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(pdfBuffer);

      const text = data.text.trim();
      const wordCount = text.split(/\s+/).filter((word: string) => word.length > 0).length;
      const processingTime = Date.now() - startTime;

      // Calculate confidence based on extracted text quality
      // PDFs with embedded text are highly reliable
      let confidence = 0.95; // High confidence for text extraction

      // Lower confidence if very little text extracted
      if (wordCount === 0) {
        confidence = 0;
      } else if (wordCount < 10) {
        confidence = 0.5; // Possibly a scanned PDF with poor text
      } else if (wordCount < 50) {
        confidence = 0.7;
      }

      // If no text extracted, might be a scanned PDF
      if (text.length === 0) {
        console.warn('[OCR] No text found in PDF. This might be a scanned PDF requiring image-based OCR.');
      }

      return {
        text,
        confidence,
        language,
        wordCount,
        processingTime,
      };
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from document (auto-detects type)
   *
   * @param fileBuffer - File buffer
   * @param mimeType - MIME type
   * @param language - OCR language (default: 'eng')
   * @param preprocessing - Preprocessing options (for images)
   * @returns OCR result with extracted text
   */
  async extractText(
    fileBuffer: Buffer,
    mimeType: string,
    language: string = this.defaultLanguage,
    preprocessing: OCRPreprocessingOptions = {}
  ): Promise<OCRResult> {
    // Determine file type and route to appropriate method
    if (mimeType.startsWith('image/')) {
      return this.extractTextFromImage(fileBuffer, language, preprocessing);
    } else if (mimeType === 'application/pdf') {
      return this.extractTextFromPDF(fileBuffer, language);
    } else {
      throw new Error(`Unsupported file type for OCR: ${mimeType}`);
    }
  }

  /**
   * Validate OCR result quality
   *
   * @param result - OCR result to validate
   * @returns Object with validation status and issues
   */
  validateOCRResult(result: OCRResult): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if text is empty
    if (!result.text || result.text.length === 0) {
      issues.push('No text extracted from document');
    }

    // Check confidence score
    if (result.confidence < 0.5) {
      issues.push(`Low confidence score: ${Math.round(result.confidence * 100)}%`);
    }

    // Check word count
    if (result.wordCount === 0) {
      issues.push('No words detected in document');
    } else if (result.wordCount < 5) {
      issues.push('Very few words detected (may indicate poor quality scan)');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get supported languages for OCR
   *
   * @returns Array of supported language codes
   */
  getSupportedLanguages(): string[] {
    return [
      'eng', // English
      'spa', // Spanish
      'fra', // French
      'deu', // German
      'ita', // Italian
      'por', // Portuguese
      'rus', // Russian
      'chi_sim', // Chinese Simplified
      'chi_tra', // Chinese Traditional
      'jpn', // Japanese
      'kor', // Korean
      'ara', // Arabic
      'hin', // Hindi
    ];
  }

  /**
   * Detect language from text (basic implementation)
   *
   * @param text - Text to analyze
   * @returns Detected language code (fallback to 'eng')
   */
  detectLanguage(text: string): string {
    // Very basic language detection
    // In production, use a proper language detection library
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'chi_sim'; // Chinese
    } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      return 'jpn'; // Japanese
    } else if (/[\uac00-\ud7af]/.test(text)) {
      return 'kor'; // Korean
    } else if (/[\u0600-\u06ff]/.test(text)) {
      return 'ara'; // Arabic
    } else if (/[\u0400-\u04ff]/.test(text)) {
      return 'rus'; // Russian
    }

    return 'eng'; // Default to English
  }
}

// Singleton instance
let ocrServiceInstance: OCRService | null = null;

/**
 * Get singleton instance of OCRService
 *
 * @returns OCRService instance
 */
export function getOCRService(): OCRService {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new OCRService();
  }
  return ocrServiceInstance;
}
