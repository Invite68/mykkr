'use client'
import { motion } from 'framer-motion'
const ITEMS = [
  { icon:'🔒', label:'OTP secured login' },
  { icon:'💸', label:'Zero commission ever' },
  { icon:'📅', label:'Live availability calendar' },
  { icon:'🚴', label:'Local delivery network' },
  { icon:'✅', label:'Verified businesses' },
  { icon:'🤝', label:'Direct WhatsApp contact' },
]
export default function TrustBar() {
  return (
    <div className="bg-ink-950 py-4 overflow-hidden">
      <motion.div className="flex gap-10 animate-marquee whitespace-nowrap" style={{width:'max-content'}}>
        {[...ITEMS,...ITEMS,...ITEMS].map((item,i) => (
          <div key={i} className="flex items-center gap-2.5 text-white/60 text-sm font-medium shrink-0">
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            <span className="text-white/20 ml-4">·</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
