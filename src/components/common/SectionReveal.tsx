"use client";

import React, { useEffect, useRef, useState } from "react";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  effect?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
  delay?: number; // delay in ms
  threshold?: number;
}

export function SectionReveal({
  children,
  className = "",
  effect = "fade-up",
  delay = 0,
  threshold = 0.1,
}: SectionRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px", // Trigger slightly before it hits view
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const getEffectStyles = () => {
    switch (effect) {
      case "fade-up":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8";
      case "scale-up":
        return isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95";
      case "slide-left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-8";
      case "slide-right":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8";
      case "fade-in":
      default:
        return isVisible ? "opacity-100" : "opacity-0";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "650ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ${getEffectStyles()} ${className}`}
    >
      {children}
    </div>
  );
}
