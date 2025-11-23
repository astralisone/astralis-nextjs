import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

/**
 * Vector Search Service
 *
 * Handles semantic search across document embeddings using cosine similarity.
 * Powers RAG (Retrieval-Augmented Generation) by finding relevant document chunks
 * to provide context for AI-powered Q&A.
 *
 * Features:
 * - Semantic search using OpenAI embeddings
 * - Cosine similarity ranking
 * - Organization-level isolation
 * - Document-scoped or cross-document search
 * - Configurable result limits
 *
 * Tech Stack:
 * - OpenAI text-embedding-3-small (1536 dimensions)
 * - PostgreSQL for storage
 * - In-memory cosine similarity calculation
 */

/**
 * Search result interface
 */
export interface SearchResult {
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
  metadata?: any;
}

/**
 * Embedding chunk interface (internal)
 */
interface EmbeddingChunk {
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata?: any;
}

/**
 * Embedding model configuration
 */
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Vector Search Service class
 */
export class VectorSearchService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for vector search');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }

  /**
   * Generate embedding vector for text using OpenAI
   *
   * @param text - Text to embed
   * @returns Embedding vector (1536 dimensions)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        encoding_format: 'float',
      });

      const embedding = response.data[0]?.embedding;

      if (!embedding) {
        throw new Error('No embedding returned from OpenAI');
      }

      if (embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
        );
      }

      return embedding;
    } catch (error) {
      console.error('[VectorSearch] Error generating embedding:', error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   *
   * Cosine similarity formula:
   * similarity = (A · B) / (||A|| * ||B||)
   *
   * Where:
   * - A · B is the dot product
   * - ||A|| and ||B|| are the magnitudes (L2 norms)
   *
   * Returns a value between -1 and 1, where:
   * - 1 = identical vectors (same direction)
   * - 0 = orthogonal vectors (no similarity)
   * - -1 = opposite vectors
   *
   * @param embedding1 - First embedding vector
   * @param embedding2 - Second embedding vector
   * @returns Cosine similarity score (0-1 for normalized vectors)
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error(
        `Embedding dimensions mismatch: ${embedding1.length} vs ${embedding2.length}`
      );
    }

    // Calculate dot product (A · B)
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    // Calculate magnitudes (||A|| and ||B||)
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    // Calculate cosine similarity
    const similarity = dotProduct / (magnitude1 * magnitude2);

    // Clamp to [0, 1] range (negative similarities indicate dissimilarity)
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Search for relevant document chunks using semantic similarity
   *
   * Process:
   * 1. Generate embedding for query text
   * 2. Retrieve all embeddings for organization (optionally filtered by document)
   * 3. Calculate cosine similarity for each chunk
   * 4. Sort by similarity and return top-k results
   *
   * @param query - Search query text
   * @param orgId - Organization ID (for multi-tenancy)
   * @param documentId - Optional: Limit search to specific document
   * @param limit - Maximum number of results to return (default: 5)
   * @returns Array of search results sorted by similarity (highest first)
   */
  async search(
    query: string,
    orgId: string,
    documentId?: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Query text cannot be empty');
    }

    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    try {
      // Step 1: Generate embedding for query
      console.log(`[VectorSearch] Generating embedding for query: "${query.substring(0, 50)}..."`);
      const queryEmbedding = await this.generateEmbedding(query);

      // Step 2: Retrieve document embeddings from database
      const where: any = { orgId };
      if (documentId) {
        where.documentId = documentId;
      }

      console.log(
        `[VectorSearch] Retrieving embeddings for orgId: ${orgId}${documentId ? `, documentId: ${documentId}` : ''}`
      );

      const embeddings = await prisma.documentEmbedding.findMany({
        where,
        select: {
          id: true,
          documentId: true,
          chunkIndex: true,
          content: true,
          embedding: true,
          metadata: true,
        },
        // Note: We retrieve all embeddings and calculate similarity in-memory
        // For large datasets (>10k chunks), consider pgvector extension for database-side similarity
      });

      if (embeddings.length === 0) {
        console.log('[VectorSearch] No embeddings found for the given criteria');
        return [];
      }

      console.log(`[VectorSearch] Retrieved ${embeddings.length} embeddings, calculating similarities...`);

      // Step 3: Calculate cosine similarity for each embedding
      const resultsWithSimilarity: SearchResult[] = embeddings.map((embedding) => {
        // Parse stored JSON embedding string to number array
        let storedEmbedding: number[];
        try {
          storedEmbedding = JSON.parse(embedding.embedding);
        } catch (error) {
          console.error(`Failed to parse embedding for chunk ${embedding.id}:`, error);
          return {
            documentId: embedding.documentId,
            chunkIndex: embedding.chunkIndex,
            content: embedding.content,
            similarity: 0,
            metadata: embedding.metadata,
          };
        }

        // Validate embedding dimensions
        if (!Array.isArray(storedEmbedding) || storedEmbedding.length !== EMBEDDING_DIMENSIONS) {
          console.error(
            `Invalid embedding dimensions for chunk ${embedding.id}: expected ${EMBEDDING_DIMENSIONS}, got ${storedEmbedding?.length || 'N/A'}`
          );
          return {
            documentId: embedding.documentId,
            chunkIndex: embedding.chunkIndex,
            content: embedding.content,
            similarity: 0,
            metadata: embedding.metadata,
          };
        }

        // Calculate similarity
        const similarity = this.cosineSimilarity(queryEmbedding, storedEmbedding);

        return {
          documentId: embedding.documentId,
          chunkIndex: embedding.chunkIndex,
          content: embedding.content,
          similarity,
          metadata: embedding.metadata,
        };
      });

      // Step 4: Sort by similarity (highest first) and return top-k
      const topResults = resultsWithSimilarity
        .filter((result) => result.similarity > 0) // Filter out zero-similarity results
        .sort((a, b) => b.similarity - a.similarity) // Sort descending
        .slice(0, limit); // Take top-k

      console.log(
        `[VectorSearch] Returning ${topResults.length} results (similarities: ${topResults
          .map((r) => r.similarity.toFixed(3))
          .join(', ')})`
      );

      return topResults;
    } catch (error) {
      console.error('[VectorSearch] Search failed:', error);
      throw new Error(
        `Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Search with similarity threshold filtering
   *
   * Only returns results with similarity above the threshold.
   * Useful for ensuring relevance quality.
   *
   * @param query - Search query text
   * @param orgId - Organization ID
   * @param threshold - Minimum similarity score (0-1, default: 0.7)
   * @param documentId - Optional: Limit search to specific document
   * @param limit - Maximum number of results (default: 5)
   * @returns Array of search results above threshold
   */
  async searchWithThreshold(
    query: string,
    orgId: string,
    threshold: number = 0.7,
    documentId?: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }

    const results = await this.search(query, orgId, documentId, limit);

    // Filter by threshold
    const filteredResults = results.filter((result) => result.similarity >= threshold);

    console.log(
      `[VectorSearch] Applied threshold ${threshold}: ${filteredResults.length}/${results.length} results passed`
    );

    return filteredResults;
  }

  /**
   * Format search results as context for RAG prompts
   *
   * Combines multiple search results into a single context string
   * suitable for including in AI prompts.
   *
   * @param results - Search results
   * @param maxLength - Maximum context length in characters (default: 4000)
   * @returns Formatted context string
   */
  formatContextForRAG(results: SearchResult[], maxLength: number = 4000): string {
    if (results.length === 0) {
      return 'No relevant context found.';
    }

    let context = 'Relevant context from documents:\n\n';
    let currentLength = context.length;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const section = `[Document ${i + 1}] (Similarity: ${(result.similarity * 100).toFixed(1)}%)\n${result.content}\n\n`;

      // Check if adding this section would exceed max length
      if (currentLength + section.length > maxLength) {
        // Try to fit as much as possible
        const remainingSpace = maxLength - currentLength - 20; // Reserve space for ellipsis
        if (remainingSpace > 100) {
          // Only add if we have meaningful space left
          context += section.substring(0, remainingSpace) + '...\n\n';
        }
        break;
      }

      context += section;
      currentLength += section.length;
    }

    return context.trim();
  }

  /**
   * Batch search: Search multiple queries in parallel
   *
   * Useful for expanding queries or multi-aspect search.
   *
   * @param queries - Array of query strings
   * @param orgId - Organization ID
   * @param documentId - Optional: Limit search to specific document
   * @param limitPerQuery - Maximum results per query (default: 3)
   * @returns Combined and deduplicated search results
   */
  async batchSearch(
    queries: string[],
    orgId: string,
    documentId?: string,
    limitPerQuery: number = 3
  ): Promise<SearchResult[]> {
    if (queries.length === 0) {
      throw new Error('At least one query is required');
    }

    if (queries.length > 10) {
      throw new Error('Maximum 10 queries allowed per batch');
    }

    console.log(`[VectorSearch] Batch search with ${queries.length} queries`);

    // Execute searches in parallel
    const searchPromises = queries.map((query) =>
      this.search(query, orgId, documentId, limitPerQuery)
    );

    const allResults = await Promise.all(searchPromises);

    // Flatten and deduplicate results
    const seenChunks = new Set<string>();
    const uniqueResults: SearchResult[] = [];

    for (const results of allResults) {
      for (const result of results) {
        const chunkKey = `${result.documentId}:${result.chunkIndex}`;
        if (!seenChunks.has(chunkKey)) {
          seenChunks.add(chunkKey);
          uniqueResults.push(result);
        }
      }
    }

    // Sort by similarity and limit total results
    const sortedResults = uniqueResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limitPerQuery * queries.length);

    console.log(
      `[VectorSearch] Batch search returned ${sortedResults.length} unique results`
    );

    return sortedResults;
  }

  /**
   * Get embedding statistics for a document or organization
   *
   * Useful for monitoring and debugging.
   *
   * @param orgId - Organization ID
   * @param documentId - Optional: Specific document
   * @returns Embedding statistics
   */
  async getEmbeddingStats(
    orgId: string,
    documentId?: string
  ): Promise<{
    totalEmbeddings: number;
    totalDocuments: number;
    avgChunksPerDocument: number;
    totalContentLength: number;
  }> {
    const where: any = { orgId };
    if (documentId) {
      where.documentId = documentId;
    }

    const embeddings = await prisma.documentEmbedding.findMany({
      where,
      select: {
        documentId: true,
        content: true,
      },
    });

    const uniqueDocuments = new Set(embeddings.map((e) => e.documentId)).size;
    const totalContentLength = embeddings.reduce((sum, e) => sum + e.content.length, 0);

    return {
      totalEmbeddings: embeddings.length,
      totalDocuments: uniqueDocuments,
      avgChunksPerDocument: uniqueDocuments > 0 ? embeddings.length / uniqueDocuments : 0,
      totalContentLength,
    };
  }
}

// Singleton instance
let vectorSearchServiceInstance: VectorSearchService | null = null;

/**
 * Get singleton instance of VectorSearchService
 *
 * @returns VectorSearchService instance
 */
export function getVectorSearchService(): VectorSearchService {
  if (!vectorSearchServiceInstance) {
    vectorSearchServiceInstance = new VectorSearchService();
  }
  return vectorSearchServiceInstance;
}
