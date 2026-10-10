'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { staggerContainer, fadeUp, scaleUp, viewport } from '@/lib/animations'

const PLANS = [
  { name:'Customer', nameHi:'ग्राहक', icon:'🛍️', price:'49', period:'/month + GST', tag:'7-day free trial', featured:false,
    features:['Browse all 66+ categories free','Unlock WhatsApp numbers of all businesses','Save favourite businesses','View live availability calendars','Contact unlimited businesses','Cancel anytime'],
    cta:'Start Free Trial →', href:'/#register' },
  { name:'Business', nameHi:'व्यापार', icon:'🏪', price:'299', period:'/month + GST', tag:'First month free', featured:true,
    features:['Full profile with unlimited photos','Live availability calendar','Listed in all categories','WhatsApp contact for subscribers','Verified business badge','Analytics — views & inquiries','Delivery network access','Zero commission on any sale','Cancel anytime'],
    cta:'List My Business Free →', href:'/#register' },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container-main">
        <motion.div className="text-center mb-16" variants={staggerContainer()} initial="hidden" whileInView="visible" viewport={viewport}>
          <motion.span variants={fadeUp} className="badge-section mb-4 block w-fit mx-auto">Simple Pricing</motion.span>
          <motion.h2 variants={fadeUp} className="section-title mb-4">Transparent. Flat. <span className="text-gradient-brand">No surprises.</span></motion.h2>
          <motion.p variants={fadeUp} className="text-ink-500 text-lg max-w-lg mx-auto">No hidden fees. No commission on your sales. You keep 100% of every rupee you earn.</motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={scaleUp} initial="hidden" whileInView="visible" viewport={viewport}
              className={`rounded-3xl p-8 border-2 relative ${plan.featured?'bg-ink-950 border-saffron-500 shadow-brand-lg':'bg-ink-50 border-ink-200 hover:border-saffron-200'} transition-all`}>
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-brand-gradient rounded-full text-white text-xs font-bold shadow-brand-sm whitespace-nowrap">
                  ⭐ Most Popular
                </div>
              )}
              <div className="text-4xl mb-4">{plan.icon}</div>
              <div className={`text-sm font-bold uppercase tracking-wide mb-2 ${plan.featured?'text-white/50':'text-ink-400'}`}>{plan.name} <span className="font-hindi normal-case">{plan.nameHi}</span></div>
              <div className={`text-5xl font-black mb-1 ${plan.featured?'text-white':'text-ink-900'}`}>₹{plan.price}</div>
              <div className={`text-sm mb-1 ${plan.featured?'text-white/40':'text-ink-400'}`}>{plan.period}</div>
              <div className={`text-xs font-semibold mb-6 px-3 py-1 rounded-full w-fit ${plan.featured?'bg-saffron-500/20 text-gold-400':'bg-green-50 text-green-600'}`}>{plan.tag}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.featured?'text-white/70':'text-ink-600'}`}>
                    <Check size={16} className={`shrink-0 mt-0.5 ${plan.featured?'text-gold-400':'text-green-500'}`}/>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                <Link href={plan.href} className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all ${plan.featured?'bg-brand-gradient text-white shadow-brand-sm hover:shadow-brand-md':'bg-white border-2 border-saffron-400 text-saffron-500 hover:bg-saffron-500 hover:text-white'}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200 max-w-2xl mx-auto" initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={viewport}>
          <p className="text-sm font-medium text-green-700">
            💡 <strong>My KKR takes zero commission</strong> on any sale, booking, or delivery.
            All payments go directly between buyer and seller.
            We only charge the flat monthly subscription fee.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
