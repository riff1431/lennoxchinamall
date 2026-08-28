"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface MotionSectionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  effect?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
  delay?: number;
  duration?: number;
  threshold?: number;
}

const sectionVariants: Record<string, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -36 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 36 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
};

export function MotionSection({
  children,
  className = "",
  effect = "fade-up",
  delay = 0,
  threshold = 0.15,
  ...props
}: MotionSectionProps) {
  const selectedVariant = sectionVariants[effect] || sectionVariants["fade-up"];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin: "0px 0px -40px 0px" }}
      variants={selectedVariant}
      transition={{ delay: delay / 1000 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
