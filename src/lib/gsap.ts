import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Set standard defaults for buttery smooth 60/120fps hardware transforms
  gsap.defaults({
    ease: "power2.out",
    duration: 0.6,
  });
}

export { gsap, ScrollTrigger };
