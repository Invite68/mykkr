'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Store, ArrowUp } from 'lucide-react'

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button onClick={() => window.scrollTo({top:0,behavior:'smooth'})}
            className="w-10 h-10 rounded-full bg-white border border-ink-200 shadow-card-hover flex items-center justify-center text-ink-600 hover:border-saffron-400 hover:text-saffron-500 transition-all"
            initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.5}}>
            <ArrowUp size={18}/>
          </motion.button>
        )}
      </AnimatePresence>
      <motion.a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-lg"
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}}
        whileHover={{scale:1.05}} whileTap={{scale:0.97}}>
        <MessageCircle size={18}/> Help
      </motion.a>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.1}} whileHover={{scale:1.05}} whileTap={{scale:0.97}}>
        <Link href="/#register" className="flex items-center gap-2 px-5 py-3 rounded-full bg-brand-gradient text-white text-sm font-bold shadow-brand-md">
          <Store size={18}/> List Business
        </Link>
      </motion.div>
    </div>
  )
}
