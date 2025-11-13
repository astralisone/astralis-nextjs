'use client';

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-async-light';

// Type assertion to bypass TypeScript JSX component error
const SyntaxHighlighterComponent = SyntaxHighlighter as any;
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import only the languages we need to reduce bundle size
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/hljs/scss';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import jsx from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/hljs/kotlin';
import dockerfile from 'react-syntax-highlighter/dist/esm/languages/hljs/dockerfile';

// Language definitions for react-syntax-highlighter v15+
const languages = {
  javascript,
  typescript,
  python,
  css,
  scss,
  html,
  xml: html,
  json,
  bash,
  shell: bash,
  sql,
  yaml,
  yml: yaml,
  markdown,
  jsx,
  tsx,
  go,
  rust,
  php,
  java,
  csharp,
  'c#': csharp,
  ruby,
  swift,
  kotlin,
  dockerfile,
  docker: dockerfile,
};

interface CodeBlockProps {
  children: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

// Custom dark theme based on Atom One Dark but enhanced for glassmorphism design
const customDarkTheme = {
  ...atomOneDark,
  hljs: {
    ...atomOneDark.hljs,
    background: 'rgba(0, 0, 0, 0.4)', // Transparent background for glassmorphism
    color: '#e5e7eb', // gray-200
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px) saturate(180%)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  'hljs-keyword': {
    color: '#c084fc', // purple-400 - enhanced primary theme
    fontWeight: '600',
  },
  'hljs-string': {
    color: '#6ee7b7', // emerald-300 - slightly brighter
  },
  'hljs-number': {
    color: '#fcd34d', // amber-300 - slightly brighter
  },
  'hljs-comment': {
    color: '#9ca3af', // gray-400 - more visible
    fontStyle: 'italic',
  },
  'hljs-function': {
    color: '#7dd3fc', // sky-300 - matches secondary blue
  },
  'hljs-variable': {
    color: '#fca5a5', // red-300
  },
  'hljs-operator': {
    color: '#c084fc', // purple-400 - matches keywords
  },
  'hljs-built_in': {
    color: '#fdba74', // orange-300
  },
  'hljs-title': {
    color: '#7dd3fc', // sky-300
    fontWeight: '600',
  },
  'hljs-type': {
    color: '#a78bfa', // violet-400
  },
  'hljs-literal': {
    color: '#6ee7b7', // emerald-300
  },
  'hljs-attr': {
    color: '#fcd34d', // amber-300
  },
  'hljs-tag': {
    color: '#fca5a5', // red-300
  },
  'hljs-meta': {
    color: '#9ca3af', // gray-400
  },
  'hljs-name': {
    color: '#fca5a5', // red-300
  },
  'hljs-selector-class': {
    color: '#fcd34d', // amber-300
  },
  'hljs-selector-id': {
    color: '#c084fc', // purple-400
  },
  'hljs-property': {
    color: '#7dd3fc', // sky-300
  },
  'hljs-value': {
    color: '#6ee7b7', // emerald-300
  },
  'hljs-regexp': {
    color: '#a78bfa', // violet-400
  },
  'hljs-symbol': {
    color: '#fdba74', // orange-300
  },
};

export function CodeBlock({
  children,
  language = 'text',
  fileName,
  showLineNumbers = true,
  highlightLines = [],
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Clean the code content
  const cleanCode = children.trim();

  return (
    <div className={cn('relative group my-6', className)}>
      {/* Header */}
      {(fileName || language !== 'text') && (
        <div className="flex items-center justify-between glass-card border-white/10 rounded-t-lg px-4 py-3 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            {fileName && (
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {fileName}
              </span>
            )}
            {language !== 'text' && (
              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-primary-500/20 to-primary-400/20 text-primary-300 rounded-md border border-primary-500/30 font-mono font-medium">
                {language.toUpperCase()}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-white/10 hover:scale-105"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />}
          </Button>
        </div>
      )}

      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighterComponent
          language={language}
          style={customDarkTheme}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={(lineNumber: number) => {
            const isHighlighted = highlightLines.includes(lineNumber);
            return {
              style: {
                backgroundColor: isHighlighted ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                borderLeft: isHighlighted ? '3px solid #a855f7' : 'none',
                paddingLeft: isHighlighted ? '1rem' : '1.25rem',
                display: 'block',
                width: '100%',
              },
            };
          }}
          customStyle={{
            margin: 0,
            borderTopLeftRadius: fileName || language !== 'text' ? 0 : '0.75rem',
            borderTopRightRadius: fileName || language !== 'text' ? 0 : '0.75rem',
            borderBottomLeftRadius: '0.75rem',
            borderBottomRightRadius: '0.75rem',
            borderTop: fileName || language !== 'text' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
          lineNumberStyle={{
            color: '#6b7280',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            paddingRight: '1rem',
            marginRight: '1rem',
            minWidth: '2rem',
            textAlign: 'right',
          }}
        >
          {cleanCode}
        </SyntaxHighlighterComponent>

        {/* Copy button for code without header */}
        {!fileName && language === 'text' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:bg-white/10 hover:scale-105 glass-card border-white/10"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />}
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper component for inline code
export function InlineCode({ children }: { children: string }) {
  return (
    <code className="relative px-2 py-1 text-sm bg-gradient-to-r from-primary-500/15 to-primary-400/15 text-primary-300 rounded-md border border-primary-500/25 font-mono font-medium hover:bg-primary-500/20 hover:border-primary-400/40 transition-all duration-200 backdrop-blur-sm">
      {children}
    </code>
  );
}
