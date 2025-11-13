'use client';

import React from 'react';
import { marked } from 'marked';
import { CodeBlock, InlineCode } from '@/components/blog/code-block';

// Note: marked package needs to be installed: npm install marked

/**
 * Process blog content to replace code blocks and inline code with syntax-highlighted components
 */
export function processCodeBlocks(htmlContent: string): React.ReactNode[] {
  if (!htmlContent) return [];

  // Split content by code blocks (both ``` and <pre><code> patterns)
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Regex patterns for different code block formats
  const patterns = [
    // Markdown style code blocks: ```language\ncode\n```
    /```(\w+)?\n([\s\S]*?)\n```/g,
    // HTML pre/code blocks: <pre><code class="language-xyz">code</code></pre>
    /<pre><code(?:\s+class="(?:language-)?(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    // Simple code blocks: <code>code</code>
    /<code(?:\s+class="(?:language-)?(\w+)")?>([^<]*?)<\/code>/g,
  ];

  let content = htmlContent;
  let matches: Array<{ start: number; end: number; language: string; code: string; isBlock: boolean }> = [];

  // Find all code blocks and inline code
  patterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const isBlock = patternIndex < 2; // First two patterns are block-level
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        language: match[1] || 'text',
        code: match[2] || match[1] || '',
        isBlock,
      });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep the first one)
  const filteredMatches = matches.filter((match, index) => {
    if (index === 0) return true;
    const prevMatch = matches[index - 1];
    return match.start >= prevMatch.end;
  });

  let lastEnd = 0;
  filteredMatches.forEach((match, index) => {
    // Add content before the code block
    if (match.start > lastEnd) {
      const beforeContent = content.slice(lastEnd, match.start);
      if (beforeContent.trim()) {
        parts.push(<div key={`content-${index}`} dangerouslySetInnerHTML={{ __html: beforeContent }} />);
      }
    }

    // Add the code block or inline code
    if (match.isBlock) {
      parts.push(
        <CodeBlock key={`code-${index}`} language={match.language} showLineNumbers={match.code.split('\n').length > 1}>
          {decodeHtmlEntities(match.code)}
        </CodeBlock>
      );
    } else {
      parts.push(<InlineCode key={`inline-${index}`}>{decodeHtmlEntities(match.code)}</InlineCode>);
    }

    lastEnd = match.end;
  });

  // Add remaining content
  if (lastEnd < content.length) {
    const remainingContent = content.slice(lastEnd);
    if (remainingContent.trim()) {
      parts.push(<div key="content-final" dangerouslySetInnerHTML={{ __html: remainingContent }} />);
    }
  }

  // If no code blocks found, return the original content
  if (parts.length === 0) {
    return [<div key="content" dangerouslySetInnerHTML={{ __html: content }} />];
  }

  return parts;
}

/**
 * Decode HTML entities in code content
 */
function decodeHtmlEntities(text: string): string {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Enhanced content processor that handles various markdown and HTML patterns
 */
export function enhancedContentProcessor(content: string): React.ReactNode {
  if (!content) return null;

  // Pre-process content to normalize code blocks
  let processedContent = content
    // Convert markdown code blocks to HTML
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre><code class="language-${language}">${code}</code></pre>`;
    })
    // Ensure inline code is properly formatted
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  const parts = processCodeBlocks(processedContent);

  return <div className="blog-content">{parts}</div>;
}

// Simple placeholder approach without encoding issues
let codeBlockCounter = 0;
let inlineCodeCounter = 0;
const codeBlockStorage = new Map<string, { code: string; language: string }>();
const inlineCodeStorage = new Map<string, string>();

// Configure marked with custom renderer for code blocks
const renderer = new marked.Renderer();

// Custom code block renderer that preserves info for our React component
renderer.code = ({ text, lang, escaped }: { text: string; lang?: string; escaped?: boolean }) => {
  const id = `CODEBLOCK_${codeBlockCounter++}`;
  codeBlockStorage.set(id, { code: text, language: lang || 'text' });
  return `<div data-codeblock-id="${id}"></div>`;
};

// Custom inline code renderer
renderer.codespan = ({ text }: { text: string }) => {
  const id = `INLINECODE_${inlineCodeCounter++}`;
  inlineCodeStorage.set(id, text);
  return `<span data-inlinecode-id="${id}"></span>`;
};

// Configure marked options
marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
});

/**
 * Enhanced markdown parser using marked library with React components for code
 */
export function parseMarkdownCodeBlocks(content: string): React.ReactNode {
  if (!content) return null;
  if (typeof document === 'undefined') {
    // Server-side: just return basic HTML
    return (
      <div
        className="prose prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
      />
    );
  }

  try {
    // Clear the storage for this parse
    codeBlockStorage.clear();
    inlineCodeStorage.clear();
    codeBlockCounter = 0;
    inlineCodeCounter = 0;

    // Parse markdown to HTML using marked
    const htmlContent = marked.parse(content) as string;

    // Create a DOM-like structure to parse and replace placeholders
    const parts: React.ReactNode[] = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Process all elements recursively
    const processNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Check if this is a code block placeholder
        const codeBlockId = element.getAttribute('data-codeblock-id');
        if (codeBlockId && codeBlockStorage.has(codeBlockId)) {
          const codeData = codeBlockStorage.get(codeBlockId)!;
          return (
            <CodeBlock key={`code-${index}`} language={codeData.language} showLineNumbers={codeData.code.split('\n').length > 1}>
              {codeData.code}
            </CodeBlock>
          );
        }

        // Check if this is an inline code placeholder
        const inlineCodeId = element.getAttribute('data-inlinecode-id');
        if (inlineCodeId && inlineCodeStorage.has(inlineCodeId)) {
          const code = inlineCodeStorage.get(inlineCodeId)!;
          return (
            <code key={`inline-${index}`} className="inline-code">
              {code}
            </code>
          );
        }

        // For other elements, recursively process children
        const children = Array.from(element.childNodes).map((child, childIndex) => processNode(child, childIndex));

        // Return appropriate JSX element based on tag name
        const tagName = element.tagName.toLowerCase();
        const props: any = { key: `element-${index}` };

        // Copy relevant attributes
        Array.from(element.attributes).forEach((attr) => {
          if (attr.name === 'class') {
            props.className = attr.value;
          } else if (attr.name === 'href' || attr.name === 'src' || attr.name === 'alt') {
            props[attr.name] = attr.value;
          }
        });

        return React.createElement(tagName, props, ...children);
      }

      return null;
    };

    // Process all child nodes
    const processedNodes = Array.from(tempDiv.childNodes)
      .map((node, index) => processNode(node, index))
      .filter(Boolean);

    return <div className="prose prose-invert prose-lg max-w-none space-y-6">{processedNodes}</div>;
  } catch (error) {
    console.error('Error parsing markdown:', error);

    // Fallback to simple HTML rendering
    return (
      <div className="prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }} />
    );
  }
}
