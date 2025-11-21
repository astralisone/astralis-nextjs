# Phase 11: AI Document Extraction

**Duration**: 1 week
**Prerequisites**: Phase 4 complete (OCR infrastructure)
**Priority**: High - Core AstralisOps feature

---

## Overview

Enhance the document processing system with AI-powered structured data extraction that pulls out specific fields like names, dates, amounts, and signatures from uploaded documents.

**Marketing Promise:**
> "Upload PDFs, photos, or scanned documents and automatically pull out names, dates, amounts, and other information. No more manually typing data from paperwork."

---

## Current State (as of Phase 6)

### What Exists
- `Document` model with OCR fields (ocrText, ocrConfidence, extractedData)
- `/api/documents/upload` with multipart file upload
- Tesseract.js OCR processing in BullMQ worker
- DigitalOcean Spaces storage integration
- Document viewer and management UI
- RAG chat with document embeddings

### What's Missing
- AI-powered structured data extraction (beyond raw OCR text)
- Document type classification (invoice vs. receipt vs. contract)
- Field extraction for specific document types
- Validation/review UI for extracted data
- Batch document processing capability
- Extraction templates for common document types

---

## Implementation Plan

### 1. AI Extraction Service

Create `src/lib/services/documentExtraction.service.ts`:

```typescript
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { spacesService } from '@/lib/services/spaces.service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractionField {
  name: string;
  value: string | number | null;
  confidence: number;
  location?: { page: number; bounds?: object };
}

interface ExtractionResult {
  documentType: string;
  documentTypeConfidence: number;
  fields: ExtractionField[];
  summary: string;
  rawExtraction: Record<string, unknown>;
}

// Extraction templates for common document types
const EXTRACTION_TEMPLATES: Record<string, string[]> = {
  invoice: [
    'invoiceNumber',
    'invoiceDate',
    'dueDate',
    'vendorName',
    'vendorAddress',
    'customerName',
    'customerAddress',
    'lineItems',
    'subtotal',
    'taxAmount',
    'totalAmount',
    'currency',
    'paymentTerms',
  ],
  receipt: [
    'merchantName',
    'merchantAddress',
    'transactionDate',
    'transactionTime',
    'items',
    'subtotal',
    'taxAmount',
    'totalAmount',
    'paymentMethod',
    'cardLastFour',
  ],
  contract: [
    'contractType',
    'effectiveDate',
    'expirationDate',
    'partyA',
    'partyB',
    'contractValue',
    'paymentTerms',
    'signatories',
    'signatureDates',
  ],
  identity: [
    'documentType',
    'fullName',
    'dateOfBirth',
    'idNumber',
    'expirationDate',
    'issuingAuthority',
    'address',
  ],
};

export class DocumentExtractionService {
  /**
   * Classify document type based on OCR text
   */
  async classifyDocument(ocrText: string): Promise<{
    type: string;
    confidence: number;
  }> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Classify the document type based on the OCR text.
Return JSON with:
- type: one of "invoice", "receipt", "contract", "identity", "letter", "report", "form", "other"
- confidence: 0-1 score

Only return valid JSON.`,
        },
        {
          role: 'user',
          content: `OCR Text:\n${ocrText.substring(0, 4000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { type: 'other', confidence: 0 };
    }

    return JSON.parse(content);
  }

  /**
   * Extract structured fields from document
   */
  async extractFields(
    ocrText: string,
    documentType: string
  ): Promise<ExtractionField[]> {
    const templateFields = EXTRACTION_TEMPLATES[documentType] || [
      'title',
      'date',
      'author',
      'content_summary',
    ];

    const fieldDescriptions = templateFields
      .map((f) => `- ${f}: description and value`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Extract structured data from the document.
Document type: ${documentType}

For each field, return:
- name: field name
- value: extracted value (string, number, or null if not found)
- confidence: 0-1 score for extraction confidence

Fields to extract:
${fieldDescriptions}

Return JSON with "fields" array.`,
        },
        {
          role: 'user',
          content: `OCR Text:\n${ocrText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.fields || [];
  }

  /**
   * Use GPT-4 Vision for image-based extraction
   */
  async extractWithVision(
    imageUrl: string,
    documentType: string
  ): Promise<ExtractionField[]> {
    const templateFields = EXTRACTION_TEMPLATES[documentType] || [];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract structured data from this ${documentType} document.
Return JSON with "fields" array where each field has: name, value, confidence (0-1).
Fields to look for: ${templateFields.join(', ')}`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Parse JSON from response (GPT-4V may include explanation text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.fields || [];
  }

  /**
   * Full extraction pipeline for a document
   */
  async processDocument(documentId: string): Promise<ExtractionResult> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    if (!document.ocrText) {
      throw new Error(`Document ${documentId} has no OCR text`);
    }

    // Classify document type
    const classification = await this.classifyDocument(document.ocrText);

    // Extract fields based on document type
    let fields: ExtractionField[];

    // For images, try vision-based extraction first
    if (document.mimeType.startsWith('image/') && document.cdnUrl) {
      try {
        fields = await this.extractWithVision(
          document.cdnUrl,
          classification.type
        );
      } catch (error) {
        console.warn('Vision extraction failed, falling back to text:', error);
        fields = await this.extractFields(document.ocrText, classification.type);
      }
    } else {
      fields = await this.extractFields(document.ocrText, classification.type);
    }

    // Generate summary
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Summarize this document in 1-2 sentences.',
        },
        {
          role: 'user',
          content: document.ocrText.substring(0, 2000),
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    const summary =
      summaryResponse.choices[0]?.message?.content || 'No summary available';

    const result: ExtractionResult = {
      documentType: classification.type,
      documentTypeConfidence: classification.confidence,
      fields,
      summary,
      rawExtraction: {
        classifiedAt: new Date().toISOString(),
        model: 'gpt-4-turbo-preview',
        ocrConfidence: document.ocrConfidence,
      },
    };

    // Save extraction results to document
    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedData: result as object,
        metadata: {
          ...(document.metadata as object || {}),
          extractionComplete: true,
          extractedAt: new Date().toISOString(),
        },
      },
    });

    return result;
  }
}

export const documentExtractionService = new DocumentExtractionService();
```

### 2. Extraction Worker

Update `src/workers/processors/ocr.processor.ts` to include extraction:

```typescript
// Add after OCR processing completes:

// Trigger AI extraction
if (document.ocrText && document.ocrText.length > 50) {
  try {
    await documentExtractionService.processDocument(document.id);
    console.log(`[OCR] Extraction complete for document ${document.id}`);
  } catch (error) {
    console.error(`[OCR] Extraction failed for ${document.id}:`, error);
    // Don't fail the job - extraction is optional enhancement
  }
}
```

### 3. Extraction Review UI

Create `src/components/documents/ExtractionReview.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit2, Save } from 'lucide-react';

interface ExtractionField {
  name: string;
  value: string | number | null;
  confidence: number;
}

interface ExtractionReviewProps {
  documentId: string;
  documentType: string;
  fields: ExtractionField[];
  onSave: (fields: ExtractionField[]) => Promise<void>;
}

export function ExtractionReview({
  documentId,
  documentType,
  fields,
  onSave,
}: ExtractionReviewProps) {
  const [editedFields, setEditedFields] = useState<ExtractionField[]>(fields);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (index: number, newValue: string) => {
    setEditedFields((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, value: newValue, confidence: 1.0 } : f
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedFields);
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="success">High</Badge>;
    if (confidence >= 0.7) return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Extracted Data</CardTitle>
          <Badge variant="outline">{documentType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {editedFields.map((field, index) => (
            <div
              key={field.name}
              className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-600 capitalize">
                  {field.name.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                {editingIndex === index ? (
                  <Input
                    value={field.value?.toString() || ''}
                    onChange={(e) => handleEdit(index, e.target.value)}
                    className="mt-1"
                    autoFocus
                  />
                ) : (
                  <div className="mt-1 text-base font-medium">
                    {field.value?.toString() || (
                      <span className="text-slate-400">Not found</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {getConfidenceBadge(field.confidence)}
                {editingIndex === index ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingIndex(null)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingIndex(index)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. API Endpoint for Extraction

Create `src/app/api/documents/[id]/extract/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { documentExtractionService } from '@/lib/services/documentExtraction.service';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        orgId: session.user.orgId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Process extraction
    const result = await documentExtractionService.processDocument(id);

    return NextResponse.json({
      success: true,
      extraction: result,
    });
  } catch (error) {
    console.error('[Extraction] Error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    // Update extraction data with user corrections
    await prisma.document.update({
      where: { id },
      data: {
        extractedData: body.extractedData,
        metadata: {
          reviewedAt: new Date().toISOString(),
          reviewedBy: session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Extraction] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update extraction' },
      { status: 500 }
    );
  }
}
```

---

## Testing Checklist

- [ ] Document type classification >85% accuracy on test set
- [ ] Invoice fields extracted correctly (invoice #, date, amounts)
- [ ] Receipt fields extracted correctly (merchant, total, date)
- [ ] Contract fields extracted correctly (parties, dates, values)
- [ ] GPT-4 Vision extraction works for images
- [ ] Review UI allows field correction
- [ ] Corrected fields saved to database
- [ ] Low-confidence fields highlighted for review
- [ ] Extraction works within 30 seconds per document

---

## Environment Variables Required

```bash
# OpenAI (existing)
OPENAI_API_KEY="sk-..."
```

---

## Success Criteria

1. Auto-classification of document types with >85% accuracy
2. Structured field extraction for invoices, receipts, contracts
3. Vision-based extraction for image documents
4. User review/correction interface for extracted data
5. Processing time <30 seconds per document
6. Confidence scoring for all extracted fields
