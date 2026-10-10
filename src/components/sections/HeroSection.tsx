'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Search, ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { staggerContainer, fadeUp, fadeLeft, fadeRight, orbVariants, orb2Variants } from '@/lib/animations'

const STATS = [
  { num: '66+',   label: 'Categories',       icon: '📂' },
  { num: '₹0',    label: 'Commission ever',   icon: '💸' },
  { num: '24/7',  label: 'Always available',  icon: '⏰' },
  { num: '100%',  label: 'Local businesses',  icon: '📍' },
]

const TRUST_BADGES = [
  { icon: <Shield size={14} />, label: 'OTP secured login' },
  { icon: <Star   size={14} />, label: 'Verified businesses' },
  { icon: <Zap    size={14} />, label: 'Instant WhatsApp connect' },
]

// Floating business cards for hero visual
const FLOAT_CARDS = [
  { emoji: '🎵', name: 'Sharma DJ',      tag: 'Available today',  color: 'from-orange-50 to-amber-50',  delay: 0 },
  { emoji: '💒', name: 'KKR Lawn',       tag: '⭐ 4.9 · Verified', color: 'from-purple-50 to-pink-50',   delay: 0.15 },
  { emoji: '📸', name: 'Pixel Perfect',  tag: '3 dates open',     color: 'from-blue-50 to-cyan-50',     delay: 0.3 },
  { emoji: '🍽️', name: 'Radha Catering', tag: 'Top rated',        color: 'from-green-50 to-emerald-50', delay: 0.45 },
]

export default function HeroSection() {
  const ref  = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-16">

      {/* Animated background */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,107,26,0.18) 0%, transparent 70%)' }}
        variants={orbVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.14) 0%, transparent 70%)' }}
        variants={orb2Variants}
        initial="initial"
        animate="animate"
      />

      {/* Mesh pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,107,26,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div className="container-main relative z-10 py-20" style={{ y, opacity }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — content */}
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-saffron-200 backdrop-blur-sm shadow-sm text-xs font-bold text-saffron-600">
                <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
                Now live in Kurukshetra, Haryana
                <span className="text-ink-400 font-normal">· Be first to join</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} className="mb-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-ink-950">
                Kurukshetra's
                <br />
                <span className="text-gradient-brand">Local Market</span>
                <br />
                <span className="text-ink-800">— online.</span>
              </h1>
            </motion.div>

            {/* Hindi tagline */}
            <motion.p
              variants={fadeUp}
              className="font-hindi text-xl sm:text-2xl font-semibold text-ink-500 mb-5"
            >
              कुरुक्षेत्र की हर ज़रूरत, एक जगह
            </motion.p>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-ink-600 leading-relaxed mb-8 max-w-lg"
            >
              Find trusted local DJs, venues, caterers, and home services.
              See live availability, compare prices, and connect directly
              on WhatsApp — <strong className="text-ink-800">zero commission, ever.</strong>
            </motion.p>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              {TRUST_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-ink-200 text-xs font-semibold text-ink-600 backdrop-blur-sm"
                >
                  <span className="text-saffron-500">{b.icon}</span>
                  {b.label}
                </span>
              ))}
            </motion.div>

            {/* Search bar */}
            <motion.div variants={fadeUp} className="mb-8">
              <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-card-hover border border-ink-200 max-w-lg">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search size={18} className="text-ink-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search DJs, venues, plumbers..."
                    className="flex-1 text-sm font-medium text-ink-800 placeholder:text-ink-400 bg-transparent outline-none"
                  />
                </div>
                <motion.button
                  className="btn-brand text-sm px-5 py-2.5 rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Search
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-ink-400 pl-2">
                Popular: <span className="text-saffron-500 cursor-pointer hover:underline">DJ</span> ·
                <span className="text-saffron-500 cursor-pointer hover:underline"> Marriage Hall</span> ·
                <span className="text-saffron-500 cursor-pointer hover:underline"> Electrician</span> ·
                <span className="text-saffron-500 cursor-pointer hover:underline"> Catering</span>
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/#register" className="btn-brand px-7 py-4 text-base shadow-brand-md">
                  List My Business Free
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/#categories" className="btn-ghost px-7 py-4 text-base">
                  Browse Businesses
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer(0.08)}
              className="grid grid-cols-4 gap-4 max-w-lg"
            >
              {STATS.map((s) => (
                <motion.div key={s.label} variants={fadeUp} className="text-center">
                  <div className="text-xl mb-0.5">{s.icon}</div>
                  <div className="text-2xl font-black text-ink-900">{s.num}</div>
                  <div className="text-xs text-ink-400 font-medium leading-tight">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — floating cards visual */}
          <motion.div
            className="hidden lg:block relative h-[580px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {FLOAT_CARDS.map((card, i) => (
              <FloatingBusinessCard key={card.name} card={card} index={i} />
            ))}

            {/* Central element */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-3xl bg-brand-gradient shadow-brand-lg flex flex-col items-center justify-center text-white"
              animate={{
                rotate: [0, 5, -5, 0],
                scale:  [1, 1.05, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl mb-1">🏪</span>
              <span className="text-sm font-bold">My KKR</span>
              <span className="text-xs opacity-75">mykkr.in</span>
            </motion.div>

            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {[
                { x1: '50%', y1: '50%', x2: '15%', y2: '20%' },
                { x1: '50%', y1: '50%', x2: '80%', y2: '15%' },
                { x1: '50%', y1: '50%', x2: '20%', y2: '78%' },
                { x1: '50%', y1: '50%', x2: '78%', y2: '75%' },
              ].map((line, i) => (
                <motion.line
                  key={i}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="rgba(255,107,26,0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                />
              ))}
            </svg>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-medium text-ink-400 tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-ink-300 flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-saffron-500"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// Floating business card component
function FloatingBusinessCard({ card, index }: { card: typeof FLOAT_CARDS[0]; index: number }) {
  const positions = [
    { top: '8%',  left: '5%'  },
    { top: '5%',  right: '2%' },
    { bottom: '18%', left: '2%' },
    { bottom: '12%', right: '0%' },
  ]
  const pos = positions[index]

  return (
    <motion.div
      className={`absolute z-10 w-44 rounded-2xl bg-gradient-to-br ${card.color} border border-white/80 shadow-card-hover p-4 backdrop-blur-sm`}
      style={pos}
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{
        opacity: 1, scale: 1, y: 0,
        translateY: [0, -10, 0],
      }}
      transition={{
        delay: card.delay + 0.5,
        duration: 0.6,
        translateY: {
          delay: card.delay + 1,
          duration: 4 + index,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={{ scale: 1.05, zIndex: 20 }}
    >
      <div className="text-3xl mb-2">{card.emoji}</div>
      <div className="text-sm font-bold text-ink-800 mb-0.5">{card.name}</div>
      <div className="text-xs text-ink-500">{card.tag}</div>
      <div className="mt-2 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-green-600 font-semibold">Available</span>
      </div>
    </motion.div>
  )
}
