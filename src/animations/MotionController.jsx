import { useEffect } from "react";

const groups = [
  "[data-stagger]",
  ".service-grid",
  ".reason-grid",
  ".steps-grid",
  ".testimonial-grid",
  ".condition-list",
  ".contact-info",
  ".about-gallery",
  ".condition-gallery",
];

const revealSelectors = [
  "[data-reveal]",
  ".section-heading",
  ".service-card",
  ".reason-item",
  ".step-item",
  ".testimonial-card",
  ".condition-chip",
  ".contact-info-item",
  ".appointment-form",
  ".image-panel",
  ".about-gallery img",
  ".condition-gallery img",
  ".faq-list .MuiAccordion-root",
];

export default function MotionController() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = [...document.querySelectorAll(revealSelectors.join(","))];

    groups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((group) => {
        [...group.children].forEach((child, index) => {
          child.style.setProperty("--gy-delay", `${Math.min(index, 7) * 75}ms`);
        });
      });
    });

    nodes.forEach((node) => node.classList.add("gy-reveal"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("gy-reveal--visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("gy-reveal--visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
