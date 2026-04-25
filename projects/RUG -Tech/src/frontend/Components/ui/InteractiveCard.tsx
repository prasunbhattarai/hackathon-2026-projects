"use client"

import { cn } from "@/lib/cn";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export const InteractiveCard = ({
  children,
  className,
}: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["7.5deg", "-7.5deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-7.5deg", "7.5deg"]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("p-4 cursor-pointer relative", className)}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        perspective: 1000,
        WebkitFontSmoothing: "antialiased",
        transform: "translateZ(0)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="relative z-10 h-full w-full"
        style={{ transform: "translateZ(30px)", backfaceVisibility: "hidden" }}
      >
        {children}
      </motion.div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-[10px] border border-[var(--brand-primary)]/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};