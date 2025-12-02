'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * ConstellationBackground Component - SVG-based network visualization
 *
 * Creates a constellation-style network of connected nodes.
 * Matches Image 3 (marketplace constellation) visual style.
 *
 * Features:
 * - SVG-based for crisp rendering at any scale
 * - Animated line drawing on mount
 * - Interactive hover effects
 * - Floating node animations
 *
 * Performance:
 * - CSS transforms for GPU acceleration
 * - Intersection Observer for lazy loading
 * - Reduced motion support
 *
 * @example
 * ```tsx
 * <ConstellationBackground
 *   nodeCount={20}
 *   connectionDistance={150}
 *   interactive={true}
 * />
 * ```
 */

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  connections: string[];
}

export interface ConstellationBackgroundProps {
  /** Number of nodes */
  nodeCount?: number;
  /** Distance threshold for connections */
  connectionDistance?: number;
  /** Enable interactive hover effects */
  interactive?: boolean;
  /** Color theme */
  color?: 'cyan' | 'blue' | 'purple';
  /** Container className */
  className?: string;
  /** Animate on mount */
  animateOnMount?: boolean;
}

export function ConstellationBackground({
  nodeCount = 20,
  connectionDistance = 150,
  interactive = true,
  color = 'cyan',
  className,
  animateOnMount = true,
}: ConstellationBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number>();

  // Color presets
  const colors = {
    cyan: '#00D4FF',
    blue: '#2B6CB0',
    purple: '#A855F7',
  };

  const nodeColor = colors[color];

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize nodes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Generate random nodes
    const newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      connections: [],
    }));

    // Calculate connections
    newNodes.forEach((node, i) => {
      newNodes.slice(i + 1).forEach((otherNode) => {
        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          node.connections.push(otherNode.id);
          otherNode.connections.push(node.id);
        }
      });
    });

    setNodes(newNodes);
  }, [nodeCount, connectionDistance]);

  // Intersection Observer
  useEffect(() => {
    if (!svgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation loop for floating nodes
  useEffect(() => {
    if (prefersReducedMotion || !isVisible || nodes.length === 0) return;

    const animate = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off edges
          const svg = svgRef.current;
          if (!svg) return node;

          const rect = svg.getBoundingClientRect();
          if (newX < 0 || newX > rect.width) newVx = -node.vx;
          if (newY < 0 || newY > rect.height) newVy = -node.vy;

          return {
            ...node,
            x: Math.max(0, Math.min(rect.width, newX)),
            y: Math.max(0, Math.min(rect.height, newY)),
            vx: newVx,
            vy: newVy,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (!prefersReducedMotion) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, nodes.length]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none',
        className
      )}
      aria-hidden="true"
      role="presentation"
    >
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={`node-gradient-${color}`}>
          <stop offset="0%" stopColor={nodeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={nodeColor} stopOpacity="0.3" />
        </radialGradient>
      </defs>

      {/* Connection lines */}
      <g className="opacity-30">
        {nodes.map((node) =>
          node.connections.map((connectionId) => {
            const connectedNode = nodes.find((n) => n.id === connectionId);
            if (!connectedNode) return null;

            const isHighlighted =
              interactive && (hoveredNode === node.id || hoveredNode === connectionId);

            return (
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={connectedNode.x}
                y2={connectedNode.y}
                stroke={nodeColor}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={animateOnMount ? '1000' : undefined}
                className={cn(
                  'transition-all duration-300',
                  animateOnMount && isVisible && 'animate-draw-line',
                  isHighlighted && 'opacity-80'
                )}
                style={{
                  strokeDashoffset: animateOnMount && !isVisible ? 1000 : 0,
                }}
              />
            );
          })
        )}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map((node, index) => {
          const isHighlighted = interactive && hoveredNode === node.id;

          return (
            <g
              key={node.id}
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 300ms ease-out ${index * 50}ms`,
              }}
            >
              {/* Outer glow (only when highlighted) */}
              {isHighlighted && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius * 3}
                  fill={`url(#node-gradient-${color})`}
                  className="animate-pulse-glow"
                />
              )}

              {/* Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={nodeColor}
                filter={`url(#glow-${color})`}
                className={cn(
                  'transition-all duration-300',
                  interactive && 'cursor-pointer',
                  isHighlighted && 'scale-150'
                )}
                onMouseEnter={
                  interactive ? () => setHoveredNode(node.id) : undefined
                }
                onMouseLeave={interactive ? () => setHoveredNode(null) : undefined}
                style={{
                  transformOrigin: `${node.x}px ${node.y}px`,
                }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
