import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/services/embedding.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * Request validation schema
 */
const searchSchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
  topK: z.number().int().min(1).max(20).optional().default(5),
  documentId: z.string().optional(),
  minSimilarity: z.number().min(0).max(1).optional().default(0),
});

/**
 * POST /api/documents/search
 *
 * Search for similar document chunks using semantic similarity.
 * Uses OpenAI embeddings and cosine similarity.
 *
 * @auth Required - User must be authenticated
 * @body query - Search query text
 * @body topK - Number of results to return (default: 5, max: 20)
 * @body documentId - Optional: filter by specific document
 * @body minSimilarity - Optional: minimum similarity score (0-1)
 * @returns Array of similar chunks with similarity scores
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = searchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { query, topK, documentId, minSimilarity } = validationResult.data;

    console.log(
      `[Search API] User ${userId} searching: "${query.substring(0, 50)}..." (topK=${topK}, docId=${documentId || 'all'})`
    );

    // If documentId specified, verify access
    if (documentId) {
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          orgId: orgId,
        },
        select: { id: true },
      });

      if (!document) {
        return NextResponse.json(
          { error: 'Document not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Perform similarity search
    const embeddingService = getEmbeddingService();
    const results = await embeddingService.searchSimilarChunks(
      query,
      orgId,
      topK,
      documentId
    );

    // Filter by minimum similarity if specified
    const filteredResults = results.filter(
      (result) => result.similarity >= minSimilarity
    );

    // Enrich results with document metadata
    const documentIds = [...new Set(filteredResults.map((r) => r.documentId))];
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        createdAt: true,
      },
    });

    const documentsMap = new Map(documents.map((doc) => [doc.id, doc]));

    const enrichedResults = filteredResults.map((result) => ({
      ...result,
      document: documentsMap.get(result.documentId) || null,
    }));

    // Log search activity
    await prisma.activityLog.create({
      data: {
        userId,
        orgId,
        action: 'SEARCH',
        entity: 'DOCUMENT',
        entityId: documentId || null,
        metadata: {
          query: query.substring(0, 100), // Truncate for storage
          topK,
          resultsCount: enrichedResults.length,
          documentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      query,
      topK,
      minSimilarity,
      documentId,
      results: enrichedResults,
      count: enrichedResults.length,
    });
  } catch (error) {
    console.error('[Search API] Error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API key')) {
        return NextResponse.json(
          {
            error: 'Service configuration error',
            details: 'OpenAI API key not configured',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: 'Please try again in a few moments',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/search/stats
 *
 * Get search/embedding statistics for the organization
 *
 * @auth Required - User must be authenticated
 * @returns Organization-wide embedding statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    // Get organization-wide statistics
    const [totalDocuments, totalEmbeddings, recentSearches] = await Promise.all([
      // Total documents in org
      prisma.document.count({
        where: { orgId },
      }),

      // Total embeddings in org
      prisma.documentEmbedding.count({
        where: { orgId },
      }),

      // Recent searches (last 10)
      prisma.activityLog.findMany({
        where: {
          orgId,
          action: 'SEARCH',
          entity: 'DOCUMENT',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          createdAt: true,
          metadata: true,
        },
      }),
    ]);

    // Get documents with embeddings
    const documentsWithEmbeddings = await prisma.document.findMany({
      where: {
        orgId,
        embeddings: {
          some: {},
        },
      },
      select: {
        id: true,
        _count: {
          select: { embeddings: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments,
        totalEmbeddings,
        documentsWithEmbeddings: documentsWithEmbeddings.length,
        avgEmbeddingsPerDocument:
          documentsWithEmbeddings.length > 0
            ? Math.round(totalEmbeddings / documentsWithEmbeddings.length)
            : 0,
      },
      recentSearches: recentSearches.map((log) => {
        const metadata = log.metadata as { query?: string; resultsCount?: number } | null;
        return {
          timestamp: log.createdAt,
          query: metadata?.query || '',
          resultsCount: metadata?.resultsCount || 0,
        };
      }),
    });
  } catch (error) {
    console.error('[Search API] Error fetching stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
