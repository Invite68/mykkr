'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeUp, fadeLeft, fadeRight, viewport } from '@/lib/animations'

const CATEGORIES = ['🎵 DJ & Sound','🍽️ Catering','📸 Photography','💒 Marriage Hall','🌿 Mehendi','⚡ Electrician','🚿 Plumber','🛒 Kirana','🍛 Restaurant','🚗 Taxi','🙏 Pandit Ji','➕ Other']
const AREAS = ['Thanesar','Pipli Road','Brahmsarovar','Sector 13','Ladwa','Shahabad','Pehowa','Other']

export default function RegisterSection() {
  const [tab, setTab]         = useState<'business'|'customer'>('business')
  const [otpSent, setOtpSent] = useState(false)
  const [phone, setPhone]     = useState('')

  return (
    <section id="register" className="py-24 bg-ink-50">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Form */}
          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewport}
            className="bg-white rounded-3xl border border-ink-200 shadow-card-hover p-8">

            {/* Tabs */}
            <div className="flex p-1 bg-ink-100 rounded-2xl mb-8">
              {(['business','customer'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setOtpSent(false) }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab===t?'bg-white text-ink-900 shadow-sm':'text-ink-500 hover:text-ink-700'}`}>
                  {t==='business'?'🏪 List My Business':'🛍️ I\'m a Customer'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>

                {tab === 'business' ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Business Name *</label>
                      <input className="input-field" placeholder="e.g. Sharma DJ Services" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Category *</label>
                        <select className="input-field">
                          <option value="">Select</option>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Area *</label>
                        <select className="input-field">
                          <option value="">Select</option>
                          {AREAS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">WhatsApp Business Number *</label>
                      <div className="flex gap-2">
                        <input className="input-field flex-1" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)}/>
                        <motion.button onClick={()=>setOtpSent(true)} whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                          className="px-4 py-3 rounded-xl bg-ink-900 text-white text-sm font-semibold whitespace-nowrap hover:bg-saffron-500 transition-colors">
                          Send OTP
                        </motion.button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {otpSent && (
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                          <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Enter OTP</label>
                          <input className="input-field text-2xl font-black text-center tracking-[12px]" type="text" maxLength={6} placeholder="······"/>
                          <p className="text-xs text-ink-400 mt-1.5">OTP sent to {phone}. Valid for 60 seconds.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Owner Name *</label>
                      <input className="input-field" placeholder="Your full name"/>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <input type="checkbox" id="biz-terms" className="mt-1 w-4 h-4 accent-saffron-500 cursor-pointer shrink-0"/>
                      <label htmlFor="biz-terms" className="text-xs text-ink-500 leading-relaxed cursor-pointer">
                        I agree to the <a href="#" className="text-saffron-500 font-semibold hover:underline">Terms of Service</a>.
                        My KKR is a connector platform — all transactions are directly between buyers and sellers.
                      </label>
                    </div>
                    <motion.button className="btn-brand w-full justify-center py-4 text-base" whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                      🚀 List My Business — First Month Free
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Your Name *</label>
                      <input className="input-field" placeholder="Your full name"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Mobile Number *</label>
                      <div className="flex gap-2">
                        <input className="input-field flex-1" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e=>setPhone(e.target.value)}/>
                        <motion.button onClick={()=>setOtpSent(true)} whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                          className="px-4 py-3 rounded-xl bg-ink-900 text-white text-sm font-semibold whitespace-nowrap hover:bg-saffron-500 transition-colors">
                          Send OTP
                        </motion.button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {otpSent && (
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
                          <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Enter OTP</label>
                          <input className="input-field text-2xl font-black text-center tracking-[12px]" type="text" maxLength={6} placeholder="······"/>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div>
                      <label className="block text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Your Area in Kurukshetra</label>
                      <select className="input-field">
                        <option value="">Select your area</option>
                        {AREAS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <input type="checkbox" id="cust-terms" className="mt-1 w-4 h-4 accent-saffron-500 cursor-pointer shrink-0"/>
                      <label htmlFor="cust-terms" className="text-xs text-ink-500 leading-relaxed cursor-pointer">
                        I agree to the <a href="#" className="text-saffron-500 font-semibold hover:underline">Terms of Service</a>.
                        My KKR connects me with local businesses — all payments are directly with the business.
                      </label>
                    </div>
                    <motion.button className="btn-brand w-full justify-center py-4 text-base" whileHover={{scale:1.02}} whileTap={{scale:0.98}}>
                      🎉 Start 7-Day Free Trial
                    </motion.button>
                    <p className="text-center text-xs text-ink-400">No payment during trial · ₹49+GST after 7 days · Cancel anytime</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewport} className="pt-4">
            <h3 className="text-2xl font-black text-ink-900 mb-6">Why businesses in Kurukshetra choose My KKR</h3>
            <div className="space-y-4">
              {[
                { icon:'📅', title:'Live availability calendar', desc:'Mark when you\'re booked. Customers see it instantly — no missed calls, no double bookings.' },
                { icon:'💬', title:'Direct WhatsApp connection', desc:'Customers who want to hire you contact directly on WhatsApp. No middleman, no commission.' },
                { icon:'💰', title:'Zero commission ever', desc:'₹299/month flat. We never take a cut from your bookings. Keep 100% of every rupee.' },
                { icon:'✅', title:'Verified business badge', desc:'Earn a verified badge that builds instant trust with customers browsing your profile.' },
                { icon:'🚴', title:'Delivery network access', desc:'For goods sellers — connect with our local rider network for same-day delivery in Kurukshetra.' },
                { icon:'📊', title:'Analytics dashboard', desc:'See how many people viewed your listing, clicked your profile, and sent inquiries.' },
              ].map((b,i) => (
                <motion.div key={b.title} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={viewport} transition={{delay:i*0.07}}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-ink-200 hover:border-saffron-200 transition-all shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-saffron-50 flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                  <div>
                    <div className="font-bold text-ink-900 text-sm mb-1">{b.title}</div>
                    <div className="text-xs text-ink-500 leading-relaxed">{b.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
