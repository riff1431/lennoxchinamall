"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Hook for subtle continuous floating animation (perfect for hero product/badge accents)
 */
export function useGsapFloat(yOffset = 8, duration = 3.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anim = gsap.to(el, {
      y: yOffset,
      duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      anim.kill();
    };
  }, [yOffset, duration]);

  return ref;
}

/**
 * Hook for smooth subtle 3D card tilt & ambient glare on hover
 */
export function useGsapTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        rotationY: x * 0.04,
        rotationX: -y * 0.04,
        transformPerspective: 1000,
        ease: "power1.out",
        duration: 0.4,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        ease: "power2.out",
        duration: 0.5,
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}
