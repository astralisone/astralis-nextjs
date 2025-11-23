import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

/**
 * Embedding Service
 *
 * Handles document chunking and OpenAI embedding generation for RAG (Retrieval-Augmented Generation).
 *
 * Features:
 * - Intelligent text chunking (~500 words per chunk with overlap)
 * - OpenAI text-embedding-3-small model (1536 dimensions)
 * - Batch processing with rate limit handling
 * - Automatic retry with exponential backoff
 * - Progress logging
 * - Stores embeddings in PostgreSQL via Prisma
 */

/**
 * Chunking options
 */
export interface ChunkingOptions {
  // Target chunk size in words (default: 500)
  chunkSize?: number;
  // Overlap between chunks in words (default: 50)
  overlap?: number;
  // Maximum chunk size in words (hard limit)
  maxChunkSize?: number;
}

/**
 * Embedding result for a single chunk
 */
export interface EmbeddingResult {
  chunkIndex: number;
  content: string;
  embedding: number[];
  tokenCount: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  totalChunks: number;
  successfulChunks: number;
  failedChunks: number;
  results: EmbeddingResult[];
  errors: Array<{ chunkIndex: number; error: string }>;
  processingTime: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Embedding Service class
 */
export class EmbeddingService {
  private openai: OpenAI;
  private embeddingModel = 'text-embedding-3-small';
  private embeddingDimensions = 1536;
  private defaultChunkingOptions: ChunkingOptions = {
    chunkSize: 500,
    overlap: 50,
    maxChunkSize: 800,
  };
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  };
  private batchSize = 20; // OpenAI allows up to 2048 inputs per request, but we'll be conservative
  private rateLimitDelayMs = 100; // Delay between batches to avoid rate limits

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }
    this.openai = new OpenAI({ apiKey: key });
  }

  /**
   * Chunk text into segments suitable for embedding
   *
   * Splits text into chunks of approximately chunkSize words with overlap
   * to maintain context across chunk boundaries.
   *
   * @param text - Text to chunk
   * @param options - Chunking options
   * @returns Array of text chunks
   */
  chunkText(text: string, options: ChunkingOptions = {}): string[] {
    const opts = { ...this.defaultChunkingOptions, ...options };
    const { chunkSize, overlap, maxChunkSize } = opts;

    if (!chunkSize || !overlap || !maxChunkSize) {
      throw new Error('Invalid chunking options');
    }

    // Clean and normalize text
    const cleanedText = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();

    if (!cleanedText) {
      return [];
    }

    // Split into words (preserving punctuation and spacing)
    const words = cleanedText.split(/\s+/);

    if (words.length === 0) {
      return [];
    }

    // If text is shorter than chunk size, return as single chunk
    if (words.length <= chunkSize) {
      return [cleanedText];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < words.length) {
      // Determine chunk end index
      let endIndex = Math.min(currentIndex + chunkSize, words.length);

      // Enforce max chunk size
      if (endIndex - currentIndex > maxChunkSize) {
        endIndex = currentIndex + maxChunkSize;
      }

      // Extract chunk
      const chunkWords = words.slice(currentIndex, endIndex);
      const chunk = chunkWords.join(' ');
      chunks.push(chunk);

      // Move to next chunk with overlap
      // If we're at the end, break
      if (endIndex >= words.length) {
        break;
      }

      // Move forward by (chunkSize - overlap) to create overlap
      currentIndex += chunkSize - overlap;

      // Safety check to prevent infinite loop
      if (currentIndex <= chunks.length * overlap) {
        console.warn('[Embedding] Overlap too large, adjusting to prevent infinite loop');
        currentIndex = endIndex - Math.floor(overlap / 2);
      }
    }

    return chunks;
  }

  /**
   * Generate embeddings for text chunks
   *
   * Calls OpenAI API to generate embeddings for an array of text chunks.
   * Handles batching and rate limiting automatically.
   *
   * @param chunks - Array of text chunks
   * @returns Array of embedding vectors (1536 dimensions each)
   */
  async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    if (!chunks || chunks.length === 0) {
      return [];
    }

    const allEmbeddings: number[][] = [];
    const batches = this.batchArray(chunks, this.batchSize);

    console.log(`[Embedding] Generating embeddings for ${chunks.length} chunks in ${batches.length} batches`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[Embedding] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} chunks)`);

      try {
        const batchEmbeddings = await this.generateEmbeddingBatch(batch);
        allEmbeddings.push(...batchEmbeddings);

        // Rate limiting delay between batches (except for last batch)
        if (batchIndex < batches.length - 1) {
          await this.sleep(this.rateLimitDelayMs);
        }
      } catch (error) {
        console.error(`[Embedding] Failed to generate embeddings for batch ${batchIndex + 1}:`, error);
        throw new Error(`Embedding generation failed at batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return allEmbeddings;
  }

  /**
   * Generate embeddings for a single batch with retry logic
   *
   * @param batch - Array of text chunks (max batchSize)
   * @returns Array of embedding vectors
   */
  private async generateEmbeddingBatch(batch: string[]): Promise<number[][]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.openai.embeddings.create({
          model: this.embeddingModel,
          input: batch,
          encoding_format: 'float',
        });

        // Extract embeddings in order
        const embeddings = response.data
          .sort((a, b) => a.index - b.index)
          .map((item) => item.embedding);

        return embeddings;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt >= this.retryConfig.maxRetries) {
          console.error(`[Embedding] Non-retryable error or max retries reached:`, error);
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelayMs
        );

        console.warn(`[Embedding] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Failed to generate embeddings after retries');
  }

  /**
   * Store embeddings in database
   *
   * Saves embedding vectors and their associated text chunks to the DocumentEmbedding table.
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID
   * @param chunks - Text chunks
   * @param embeddings - Embedding vectors (must match chunks length)
   */
  async storeEmbeddings(
    documentId: string,
    orgId: string,
    chunks: string[],
    embeddings: number[][]
  ): Promise<void> {
    if (chunks.length !== embeddings.length) {
      throw new Error(`Chunks and embeddings length mismatch: ${chunks.length} vs ${embeddings.length}`);
    }

    console.log(`[Embedding] Storing ${chunks.length} embeddings for document ${documentId}`);

    try {
      // Delete existing embeddings for this document (if re-processing)
      const deletedCount = await prisma.documentEmbedding.deleteMany({
        where: { documentId },
      });

      if (deletedCount.count > 0) {
        console.log(`[Embedding] Deleted ${deletedCount.count} existing embeddings`);
      }

      // Prepare embedding records
      const embeddingRecords = chunks.map((content, index) => ({
        documentId,
        orgId,
        chunkIndex: index,
        content,
        embedding: JSON.stringify(embeddings[index]), // Store as JSON array
        metadata: {
          wordCount: content.split(/\s+/).length,
          charCount: content.length,
        },
      }));

      // Batch insert embeddings (Prisma doesn't support batch insert directly, so use createMany)
      const result = await prisma.documentEmbedding.createMany({
        data: embeddingRecords,
        skipDuplicates: false,
      });

      console.log(`[Embedding] Successfully stored ${result.count} embeddings`);
    } catch (error) {
      console.error('[Embedding] Failed to store embeddings in database:', error);
      throw new Error(`Failed to store embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Embed a document (main orchestration method)
   *
   * Retrieves document from database, chunks OCR text, generates embeddings,
   * and stores results. Updates document status accordingly.
   *
   * @param documentId - Document ID to embed
   */
  async embedDocument(documentId: string): Promise<void> {
    console.log(`[Embedding] Starting embedding process for document ${documentId}`);
    const startTime = Date.now();

    try {
      // Fetch document from database
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          orgId: true,
          fileName: true,
          ocrText: true,
          status: true,
        },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      if (!document.ocrText) {
        throw new Error(`Document ${documentId} has no OCR text. Run OCR processing first.`);
      }

      if (document.status !== 'COMPLETED') {
        console.warn(`[Embedding] Document status is ${document.status}, not COMPLETED. Proceeding anyway.`);
      }

      console.log(`[Embedding] Processing document: ${document.fileName} (${document.ocrText.length} characters)`);

      // Chunk the OCR text
      const chunks = this.chunkText(document.ocrText);
      console.log(`[Embedding] Created ${chunks.length} chunks`);

      if (chunks.length === 0) {
        throw new Error('No chunks generated from OCR text');
      }

      // Generate embeddings
      const embeddings = await this.generateEmbeddings(chunks);

      if (embeddings.length !== chunks.length) {
        throw new Error(`Embedding count mismatch: expected ${chunks.length}, got ${embeddings.length}`);
      }

      // Store embeddings in database
      await this.storeEmbeddings(document.id, document.orgId, chunks, embeddings);

      const processingTime = Date.now() - startTime;
      console.log(`[Embedding] Successfully embedded document ${documentId} in ${processingTime}ms`);
      console.log(`[Embedding] Stats: ${chunks.length} chunks, ${embeddings.length} embeddings, avg chunk size: ${Math.round(document.ocrText.length / chunks.length)} chars`);
    } catch (error) {
      console.error(`[Embedding] Failed to embed document ${documentId}:`, error);
      throw new Error(`Document embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch embed multiple documents
   *
   * @param documentIds - Array of document IDs
   * @returns Summary of processing results
   */
  async embedDocuments(documentIds: string[]): Promise<{
    successful: string[];
    failed: Array<{ documentId: string; error: string }>;
  }> {
    console.log(`[Embedding] Batch embedding ${documentIds.length} documents`);

    const successful: string[] = [];
    const failed: Array<{ documentId: string; error: string }> = [];

    for (const documentId of documentIds) {
      try {
        await this.embedDocument(documentId);
        successful.push(documentId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Embedding] Failed to embed document ${documentId}:`, errorMessage);
        failed.push({ documentId, error: errorMessage });
      }

      // Small delay between documents to avoid overwhelming the system
      if (documentIds.indexOf(documentId) < documentIds.length - 1) {
        await this.sleep(500);
      }
    }

    console.log(`[Embedding] Batch complete: ${successful.length} successful, ${failed.length} failed`);

    return { successful, failed };
  }

  /**
   * Search for similar chunks using cosine similarity
   *
   * Note: This is a simple in-memory search. For production, consider using
   * a vector database like pgvector, Pinecone, or Weaviate.
   *
   * @param queryText - Query text
   * @param orgId - Organization ID (for filtering)
   * @param topK - Number of results to return (default: 5)
   * @param documentId - Optional: filter by specific document
   * @returns Array of similar chunks with scores
   */
  async searchSimilarChunks(
    queryText: string,
    orgId: string,
    topK: number = 5,
    documentId?: string
  ): Promise<Array<{
    documentId: string;
    chunkIndex: number;
    content: string;
    similarity: number;
  }>> {
    console.log(`[Embedding] Searching for similar chunks in org ${orgId}`);

    // Generate embedding for query
    const queryEmbeddings = await this.generateEmbeddings([queryText]);
    const queryEmbedding = queryEmbeddings[0];

    // Fetch all embeddings for the organization
    const embeddings = await prisma.documentEmbedding.findMany({
      where: {
        orgId,
        ...(documentId && { documentId }),
      },
      select: {
        documentId: true,
        chunkIndex: true,
        content: true,
        embedding: true,
      },
    });

    // Calculate cosine similarity for each embedding
    const results = embeddings.map((emb) => {
      const embeddingVector = JSON.parse(emb.embedding) as number[];
      const similarity = this.cosineSimilarity(queryEmbedding, embeddingVector);

      return {
        documentId: emb.documentId,
        chunkIndex: emb.chunkIndex,
        content: emb.content,
        similarity,
      };
    });

    // Sort by similarity (descending) and return top K
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`[Embedding] Found ${topResults.length} similar chunks (top ${topK})`);

    return topResults;
  }

  /**
   * Calculate cosine similarity between two vectors
   *
   * @param vecA - First vector
   * @param vecB - Second vector
   * @returns Cosine similarity score (0 to 1)
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Batch array into smaller chunks
   *
   * @param array - Array to batch
   * @param batchSize - Size of each batch
   * @returns Array of batches
   */
  private batchArray<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   *
   * @param error - Error to check
   * @returns True if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Retryable errors
      if (
        message.includes('rate limit') ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('socket hang up') ||
        message.includes('503') ||
        message.includes('502') ||
        message.includes('500')
      ) {
        return true;
      }

      // Non-retryable errors
      if (
        message.includes('401') || // Unauthorized
        message.includes('403') || // Forbidden
        message.includes('400') || // Bad request
        message.includes('invalid') ||
        message.includes('api key')
      ) {
        return false;
      }
    }

    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Get embedding statistics for a document
   *
   * @param documentId - Document ID
   * @returns Embedding statistics
   */
  async getEmbeddingStats(documentId: string): Promise<{
    totalChunks: number;
    totalWords: number;
    avgChunkSize: number;
    minChunkSize: number;
    maxChunkSize: number;
  } | null> {
    const embeddings = await prisma.documentEmbedding.findMany({
      where: { documentId },
      select: {
        content: true,
      },
    });

    if (embeddings.length === 0) {
      return null;
    }

    const wordCounts = embeddings.map((emb) => emb.content.split(/\s+/).length);
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);

    return {
      totalChunks: embeddings.length,
      totalWords,
      avgChunkSize: Math.round(totalWords / embeddings.length),
      minChunkSize: Math.min(...wordCounts),
      maxChunkSize: Math.max(...wordCounts),
    };
  }
}

// Singleton instance
let embeddingServiceInstance: EmbeddingService | null = null;

/**
 * Get singleton instance of EmbeddingService
 *
 * @param apiKey - Optional OpenAI API key (uses env var if not provided)
 * @returns EmbeddingService instance
 */
export function getEmbeddingService(apiKey?: string): EmbeddingService {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new EmbeddingService(apiKey);
  }
  return embeddingServiceInstance;
}
