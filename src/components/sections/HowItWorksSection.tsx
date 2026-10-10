'use client'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp, cardVariants, viewport } from '@/lib/animations'

const STEPS = [
  { num:'01', icon:'🔍', title:'Browse Free', titleHi:'मुफ़्त ब्राउज़ करें', desc:'Explore all 66+ categories, see photos, prices, and ratings — no account needed.', color:'from-orange-50 to-amber-50', border:'border-orange-200' },
  { num:'02', icon:'📅', title:'Check Availability', titleHi:'उपलब्धता देखें', desc:'See live calendars. Green dates are free, red are booked. Search by your event date instantly.', color:'from-green-50 to-emerald-50', border:'border-green-200' },
  { num:'03', icon:'💬', title:'Connect on WhatsApp', titleHi:'व्हाट्सएप पर जुड़ें', desc:'Subscribe for ₹49/month to unlock direct WhatsApp contact with any business.', color:'from-blue-50 to-cyan-50', border:'border-blue-200' },
  { num:'04', icon:'🤝', title:'Deal Done Directly', titleHi:'सीधा सौदा', desc:'All payments between you and the business. My KKR takes zero commission — ever.', color:'from-purple-50 to-pink-50', border:'border-purple-200' },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-ink-50">
      <div className="container-main">
        <motion.div className="text-center mb-16" variants={staggerContainer()} initial="hidden" whileInView="visible" viewport={viewport}>
          <motion.span variants={fadeUp} className="badge-section mb-4 block w-fit mx-auto">How It Works</motion.span>
          <motion.h2 variants={fadeUp} className="section-title mb-4">Simple as a <span className="text-gradient-brand">WhatsApp message</span></motion.h2>
          <motion.p variants={fadeUp} className="text-ink-500 text-lg max-w-xl mx-auto">No complicated bookings. No advance payments. Find, check, contact — done.</motion.p>
        </motion.div>
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
          {STEPS.map((step) => (
            <motion.div key={step.num} variants={cardVariants} whileHover="hover" whileTap="tap" className={`relative p-6 rounded-3xl bg-gradient-to-br ${step.color} border-2 ${step.border} overflow-hidden`}>
              <div className="absolute top-4 right-4 text-6xl font-black text-black/5">{step.num}</div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-ink-900 mb-1">{step.title}</h3>
              <p className="font-hindi text-xs text-ink-400 mb-3">{step.titleHi}</p>
              <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
