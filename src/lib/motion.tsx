"use client";

import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ============================================================
// Premium Motion System
// ============================================================
// Centralized tokens + reusable primitives inspired by Motion UI
// and 21st.dev patterns. All animations respect reduced-motion
// via the .reduce-motion CSS class.
// ============================================================

export const MOTION = {
  duration: {
    fast: 0.18,
    standard: 0.3,
    slow: 0.5,
    slower: 0.7,
  },
  easing: {
    // Premium ease-out for entrances
    out: [0.16, 1, 0.3, 1] as [number, number, number, number],
    // Spring-like ease for interactions
    spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    // Standard in-out
    inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  stagger: {
    fast: 0.04,
    standard: 0.06,
    slow: 0.1,
  },
};

// ============================================================
// Page transition wrapper
// ============================================================

export function PageTransition({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <motion.div
      key={k}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: MOTION.duration.standard,
        ease: MOTION.easing.out,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Staggered list wrapper
// ============================================================

export function StaggerGroup({
  children,
  className,
  stagger = MOTION.stagger.standard,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 8,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION.duration.standard,
            ease: MOTION.easing.out,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Reveal on scroll
// ============================================================

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 16,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-50px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration: MOTION.duration.slow,
        ease: MOTION.easing.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Animated number (counts up)
// ============================================================

export function AnimatedNumber({
  value,
  duration = 1,
  format = (n: number) => Math.round(n).toString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        previousValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
}

// ============================================================
// Magnetic button (subtle pull toward cursor)
// ============================================================

export function MagneticButton({
  children,
  className,
  strength = 0.2,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

// ============================================================
// Animated progress ring (SVG)
// ============================================================

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  trackClassName,
  showLabel = true,
  label,
  animateOnMount = true,
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  showLabel?: boolean;
  label?: React.ReactNode;
  animateOnMount?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName || "stroke-muted"}
        />
        <motion.circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={className || "stroke-primary"}
          strokeDasharray={circumference}
          initial={animateOnMount ? { strokeDashoffset: circumference } : false}
          animate={
            animateOnMount
              ? inView
                ? { strokeDashoffset: offset }
                : { strokeDashoffset: circumference }
              : { strokeDashoffset: offset }
          }
          transition={{
            duration: 1.2,
            ease: MOTION.easing.out,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label ?? (
            <AnimatedNumber
              value={value}
              className="text-sm font-semibold tabular-nums"
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Typing dots (chat)
// ============================================================

export function TypingDots({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Confetti burst (subtle, premium)
// ============================================================

export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const particles = Array.from({ length: 14 });
  return (
    <AnimatePresence>
      {trigger && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((_, i) => {
            const angle = (i / particles.length) * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  background: i % 2 === 0
                    ? "oklch(0.62 0.13 165)"
                    : "oklch(0.7 0.1 180)",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance - 10,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Tactile press wrapper
// ============================================================

export function Tactile({
  children,
  className,
  scale = 0.97,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { scale?: number }) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: MOTION.duration.fast, ease: MOTION.easing.spring }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// FadeIn for hero text
// ============================================================

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION.duration.slow,
        ease: MOTION.easing.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
