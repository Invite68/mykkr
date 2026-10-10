'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Lock } from 'lucide-react'
import { FEATURED_BUSINESSES } from '@/types'
import { formatPriceRange } from '@/lib/utils'
import { staggerContainer, cardVariants, fadeUp, viewport } from '@/lib/animations'

const TABS = ['All','🎉 Events','🏛️ Venues','🔧 Services','🍛 Food']

export default function ListingsSection() {
  const [active, setActive] = useState(0)
  const [locked, setLocked] = useState(true)

  return (
    <section className="py-24 bg-white">
      <div className="container-main">
        <motion.div className="mb-12" variants={staggerContainer()} initial="hidden" whileInView="visible" viewport={viewport}>
          <motion.span variants={fadeUp} className="badge-section mb-4 block w-fit">Featured Businesses</motion.span>
          <motion.h2 variants={fadeUp} className="section-title mb-4">Trusted businesses <span className="text-gradient-brand">near you</span></motion.h2>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab,i) => (
            <motion.button key={tab} onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${active===i?'bg-saffron-500 text-white border-saffron-500 shadow-brand-sm':'bg-ink-50 text-ink-600 border-ink-200 hover:border-saffron-300'}`}
              whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
              {tab}
            </motion.button>
          ))}
        </div>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewport}>
          {FEATURED_BUSINESSES.map((biz,i) => (
            <motion.div key={biz.id} variants={cardVariants} whileHover="hover" whileTap="tap"
              className="bg-ink-50 rounded-2xl border border-ink-200 overflow-hidden cursor-pointer">
              <div className={`h-44 flex items-center justify-center text-6xl bg-gradient-to-br ${['from-orange-50 to-amber-100','from-purple-50 to-pink-100','from-blue-50 to-cyan-100','from-green-50 to-emerald-100'][i]}`}>
                {biz.photos?.[0]}
                <div className="absolute top-3 left-3">
                  {biz.isVerified && <span className="badge-verified text-xs">✓ Verified</span>}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-saffron-500 uppercase tracking-wide mb-1">{biz.category?.nameEn}</div>
                <h3 className="font-bold text-ink-900 mb-1 leading-tight">{biz.name}</h3>
                <div className="flex items-center gap-1 text-xs text-ink-400 mb-3">
                  <MapPin size={11}/> {biz.area}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-saffron-500">{formatPriceRange(biz.priceMin!,biz.priceMax!)}</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-ink-700">
                    <Star size={12} className="text-gold-500 fill-gold-500"/> {biz.avgRating} <span className="text-ink-400 font-normal">({biz.totalReviews})</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => setLocked(l => !l)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${locked && i>0?'bg-ink-100 text-ink-400':'bg-ink-900 text-white hover:bg-saffron-500'}`}
                  whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                  {locked && i > 0 ? <><Lock size={13}/> Subscribe to Contact</> : <>💬 Contact on WhatsApp</>}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
