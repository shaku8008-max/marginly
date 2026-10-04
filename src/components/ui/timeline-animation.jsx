/**
 * TimelineContent - Animation wrapper component.
 * Simplified version for scroll-based animations.
 */
import { motion } from "motion/react";

export default function TimelineContent({
  as = "div",
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  className = "",
  ...props
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={animationNum}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}