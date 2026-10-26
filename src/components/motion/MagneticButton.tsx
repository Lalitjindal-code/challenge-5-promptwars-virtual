import React, { useRef, useCallback } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

/**
 * MagneticButton
 * Subtle, premium magnetic cursor pull effect with spring physics.
 * Automatically disabled on touch or reduced motion devices.
 */
export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = "",
  strength = 16,
  onClick,
  type = "button",
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Limit pull within strength radius
      x.set((distanceX / (rect.width / 2)) * strength);
      y.set((distanceY / (rect.height / 2)) * strength);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative inline-flex items-center justify-center transition-shadow duration-200 ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
