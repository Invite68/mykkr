'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { slideInRight, fadeDown } from '@/lib/animations'

const NAV_LINKS = [
  {
    label: 'Browse',
    href: '/#categories',
    children: [
      { label: 'Event Services', href: '/category/event-services', icon: '🎉' },
      { label: 'Venues',         href: '/category/venues',         icon: '🏛️' },
      { label: 'Food & Dining',  href: '/category/food-dining',    icon: '🍽️' },
      { label: 'Home Services',  href: '/category/home-services',  icon: '🔧' },
      { label: 'All Categories', href: '/categories',              icon: '➕' },
    ],
  },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/#pricing' },
  { label: 'For Business', href: '/#register' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 20)
  })

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-ink-200/80 shadow-sm'
            : 'bg-transparent'
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-lg shadow-brand-sm"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                M
              </motion.div>
              <span className="text-xl font-black text-ink-900">
                My<span className="text-gradient-brand">KKR</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium',
                      'text-ink-600 hover:text-saffron-500 hover:bg-saffron-50',
                      'transition-all duration-200'
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200',
                          activeMenu === link.label && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeMenu === link.label && (
                      <motion.div
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-ink-200 shadow-card-hover overflow-hidden"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{   opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <div className="p-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-saffron-50 hover:text-saffron-600 transition-all duration-150"
                            >
                              <span className="text-base">{child.icon}</span>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-saffron-500 transition-colors"
              >
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/#register" className="btn-brand text-sm px-5 py-2.5">
                  List Free 🚀
                </Link>
              </motion.div>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center border border-ink-200 bg-white/80"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={20} className="text-ink-700" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={20} className="text-ink-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-white shadow-2xl flex flex-col"
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-ink-100">
                <span className="text-lg font-black text-ink-900">
                  My<span className="text-gradient-brand">KKR</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-ink-100 transition-colors"
                >
                  <X size={18} className="text-ink-600" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto p-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-ink-700 hover:bg-saffron-50 hover:text-saffron-600 transition-all mb-1"
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mb-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm text-ink-500 hover:text-saffron-500 transition-colors"
                          >
                            <span>{child.icon}</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Bottom CTAs */}
              <div className="p-4 border-t border-ink-100 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost w-full justify-center"
                >
                  Login
                </Link>
                <Link
                  href="/#register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-brand w-full justify-center"
                >
                  List My Business Free 🚀
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
