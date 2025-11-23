import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/automations/templates
 *
 * List available automation templates.
 *
 * Query params:
 * - category: Filter by category (e.g., 'email', 'crm', 'document')
 * - difficulty: Filter by difficulty ('beginner', 'intermediate', 'advanced')
 * - search: Search templates by name/description
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20)
 *
 * Auth: Required
 * Returns: TemplateListResponse
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication is optional for browsing templates
    // (Required for deployment in the POST endpoint)
    const session = await auth();

    // 2. Parse query parameters
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 3. Build database query with filters
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // 4. Get total count for pagination
    const total = await prisma.automationTemplate.count({ where });

    // 5. Fetch templates from database
    const skip = (page - 1) * pageSize;
    const templates = await prisma.automationTemplate.findMany({
      where,
      orderBy: [
        { isOfficial: 'desc' }, // Official templates first
        { useCount: 'desc' },   // Then by popularity
        { rating: 'desc' },     // Then by rating
      ],
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        requiredIntegrations: true,
        tags: true,
        useCount: true,
        rating: true,
        isOfficial: true,
        n8nWorkflowJson: true,
        thumbnailUrl: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    // 6. Transform templates for response
    const transformedTemplates = templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      requiredIntegrations: template.requiredIntegrations,
      tags: template.tags,
      useCount: template.useCount,
      rating: template.rating,
      isOfficial: template.isOfficial,
      workflowJson: template.n8nWorkflowJson ? JSON.parse(template.n8nWorkflowJson) : null,
      thumbnailUrl: template.thumbnailUrl,
      publishedAt: template.publishedAt,
      createdAt: template.createdAt,
    }));

    // 7. Return templates with pagination
    return NextResponse.json({
      success: true,
      data: transformedTemplates,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: skip + pageSize < total,
      },
    });

  } catch (error) {
    console.error('[API /api/automations/templates GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
