import { Variants, Transition } from 'framer-motion'

// ── Shared transitions ───────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const smoothSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

export const ease: Transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94],
}

export const easeOut: Transition = {
  duration: 0.4,
  ease: [0.0, 0.0, 0.2, 1],
}

// ── Stagger container ────────────────────────────────────────

export const staggerContainer = (
  staggerChildren = 0.1,
  delayChildren = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
})

// ── Fade variants ────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: ease },
}

export const fadeDown: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: ease },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: ease },
}

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: ease },
}

// ── Scale variants ───────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: smoothSpring },
}

export const scaleUp: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: smoothSpring },
}

export const popIn: Variants = {
  hidden:  { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 600, damping: 20 } },
}

// ── Card variants ────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: smoothSpring },
  hover:   { y: -6, scale: 1.01, transition: spring },
  tap:     { scale: 0.98, transition: { duration: 0.1 } },
}

// ── Slide variants ───────────────────────────────────────────

export const slideInLeft: Variants = {
  hidden:  { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: smoothSpring },
  exit:    { x: '-100%', opacity: 0, transition: easeOut },
}

export const slideInRight: Variants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: smoothSpring },
  exit:    { x: '100%', opacity: 0, transition: easeOut },
}

export const slideInBottom: Variants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: smoothSpring },
  exit:    { y: '100%', opacity: 0, transition: easeOut },
}

// ── Modal/overlay ────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}

export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 32 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: smoothSpring },
  exit:    { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.25, ease: 'easeIn' } },
}

export const drawerVariants: Variants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: smoothSpring },
  exit:    { y: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
}

// ── Text animations ──────────────────────────────────────────

export const letterVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export const wordVariants: Variants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

// ── Number counter ───────────────────────────────────────────

export const counterVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// ── Nav ──────────────────────────────────────────────────────

export const navVariants: Variants = {
  top:      { backgroundColor: 'rgba(255,253,249,0)', boxShadow: 'none' },
  scrolled: {
    backgroundColor: 'rgba(255,253,249,0.95)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    transition: { duration: 0.3 },
  },
}

// ── Utility: viewport config for scroll animations ───────────

export const viewport = {
  once: true,
  margin: '-80px',
}

// ── Hero background orbs ─────────────────────────────────────

export const orbVariants: Variants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.6, 0.8, 0.6],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const orb2Variants: Variants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.7, 0.5],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: 2,
    },
  },
}
