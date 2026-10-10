'use client'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp, fadeLeft, viewport } from '@/lib/animations'
const OPTIONS = [
  { icon:'🚴', title:'Partner Rider', titleHi:'पार्टनर राइडर', desc:'Local riders get Telegram notifications and accept deliveries. Cash payment directly to rider.' },
  { icon:'🏪', title:'Click & Collect', titleHi:'क्लिक और कलेक्ट', desc:'Order on WhatsApp, walk in and collect. No queue, order ready when you arrive.' },
  { icon:'🛵', title:'Business Delivery', titleHi:'दुकान डिलीवरी', desc:'Many businesses deliver themselves within their local area.' },
]
export default function DeliverySection() {
  return (
    <section className="py-24 bg-ink-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-orange" />
      <div className="container-main relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-500/20 text-gold-400 text-xs font-bold border border-saffron-500/30 mb-5">🚴 Delivery Network</motion.span>
            <motion.h2 variants={fadeUp} className="section-title text-white mb-5">Local delivery,<br /><span className="text-gradient-brand">Kurukshetra style</span></motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg mb-8 leading-relaxed">Our network of local riders accepts deliveries through Telegram. Fast, simple, no app needed.</motion.p>
            <motion.div variants={staggerContainer(0.08)} className="space-y-4">
              {OPTIONS.map(opt => (
                <motion.div key={opt.title} variants={fadeUp} whileHover={{x:4}} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-saffron-500/40 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-2xl shrink-0">{opt.icon}</div>
                  <div>
                    <div className="font-bold text-white mb-0.5">{opt.title} <span className="font-hindi text-white/40 text-xs ml-1">{opt.titleHi}</span></div>
                    <p className="text-sm text-white/55 leading-relaxed">{opt.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewport}>
            <div className="bg-white/6 border border-white/12 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl">✈️</div>
                <div>
                  <div className="font-bold text-white text-sm">My KKR Riders 🚴</div>
                  <div className="text-xs text-white/40">23 riders · 4 active now</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/><span className="text-xs text-green-400 font-semibold">Live</span></div>
              </div>
              <div className="bg-white/8 rounded-2xl p-4 border border-white/8 mb-4">
                <div className="text-xs font-bold text-gold-400 mb-3">🤖 MyKKR Delivery Bot</div>
                <div className="text-sm text-white/80 leading-relaxed space-y-1">
                  <div>🚴 <strong>New Delivery Available</strong></div>
                  <div>📦 Groceries (medium bag)</div>
                  <div>📍 Pickup: Sharma Kirana, Gandhi Nagar</div>
                  <div>🏠 Drop: 14 Nehru Colony <span className="text-white/40">(1.8 km)</span></div>
                  <div>💰 Delivery fee: <strong className="text-green-400">₹40</strong> cash</div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <span className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold">✅ Suresh accepted!</span>
                  <span className="px-3 py-1.5 rounded-full border border-white/15 text-white/60 text-xs">📍 Navigate</span>
                  <span className="px-3 py-1.5 rounded-full border border-white/15 text-white/60 text-xs">📞 Call</span>
                </div>
              </div>
              <div className="text-xs text-white/30 text-center">Response time: avg 3 minutes · 94% acceptance rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
