'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
    // Check if device is desktop/has hover capability
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    // Motion values for direct tracking
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Spring animations for the follower (outer ring)
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Only show on devices with fine pointer
        const mediaQuery = window.matchMedia('(pointer: fine)');
        setIsVisible(mediaQuery.matches);

        const handleMouseMove = (e: MouseEvent) => {
            // Direct update for inner dot (instant)
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if we are hovering over an interactive element
            const interactive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(!!interactive);
        };

        if (mediaQuery.matches) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mouseover', handleMouseOver);

            // Hide system cursor
            document.documentElement.style.cursor = 'none';
            document.body.style.cursor = 'none';

            // Add global style to force cursor none on all elements
            const style = document.createElement('style');
            style.id = 'custom-cursor-style';
            style.textContent = `
        * { cursor: none !important; }
        .no-cursor-hide { cursor: text !important; } 
      `;
            document.head.appendChild(style);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);

            // Restore system cursor
            document.documentElement.style.cursor = 'auto';
            document.body.style.cursor = 'auto';
            const style = document.getElementById('custom-cursor-style');
            if (style) style.remove();
        };
    }, [mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[100001] overflow-hidden">
            {/* Follower (Outer Ring) - Lags behind */}
            <motion.div
                className={cn(
                    "absolute rounded-full border border-[#2B6CB0] opacity-50 backdrop-blur-sm transition-all duration-300",
                    isHovering ? "h-12 w-12 -ml-6 -mt-6 bg-[#2B6CB0]/20 border-[#2B6CB0]" : "h-8 w-8 -ml-4 -mt-4 bg-transparent"
                )}
                style={{
                    x: springX,
                    y: springY,
                    scale: isClicking ? 0.8 : 1
                }}
            />

            {/* Main Cursor (Dot) - Instant */}
            <motion.div
                className={cn(
                    "absolute rounded-full bg-[#0A1B2B] shadow-[0_0_10px_rgba(43,108,176,0.8)] transition-all duration-150",
                    isHovering ? "h-2 w-2 -ml-1 -mt-1 bg-[#2B6CB0]" : "h-3 w-3 -ml-1.5 -mt-1.5"
                )}
                style={{
                    x: mouseX,
                    y: mouseY,
                }}
            />
        </div>
    );
}
