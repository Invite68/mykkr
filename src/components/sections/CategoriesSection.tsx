'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_GROUPS } from '@/types'
import { staggerContainer, fadeUp, cardVariants, viewport } from '@/lib/animations'

export default function CategoriesSection() {
  const [activeGroup, setActiveGroup] = useState(CATEGORY_GROUPS[0].id)

  const currentGroup = CATEGORY_GROUPS.find(g => g.id === activeGroup)!

  return (
    <section id="categories" className="py-24 bg-white">
      <div className="container-main">

        {/* Header */}
        <motion.div
          className="mb-14"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.span variants={fadeUp} className="badge-section mb-4 block w-fit">
            📂 Browse by Category
          </motion.span>
          <motion.h2 variants={fadeUp} className="section-title mb-4">
            Everything Kurukshetra needs,<br />
            <span className="text-gradient-brand">one platform</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-ink-500 text-lg max-w-xl">
            From wedding DJs to local kirana stores — find any service in your city,
            with live availability and direct WhatsApp contact.
          </motion.p>
        </motion.div>

        {/* Group tabs */}
        <motion.div
          className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5 }}
        >
          {CATEGORY_GROUPS.map((group) => (
            <motion.button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                activeGroup === group.id
                  ? 'bg-saffron-500 text-white border-saffron-500 shadow-brand-sm'
                  : 'bg-ink-50 text-ink-600 border-ink-200 hover:border-saffron-300 hover:text-saffron-500'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base">{group.icon}</span>
              <span>{group.nameEn}</span>
              <span className="font-hindi text-xs opacity-70">{group.nameHi}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Categories grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {currentGroup.categories.map((cat) => (
              <motion.div key={cat.id} variants={cardVariants} whileHover="hover" whileTap="tap">
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center p-5 rounded-2xl border-2 border-ink-100 bg-ink-50 hover:border-saffron-300 hover:bg-saffron-50 transition-all duration-200 group text-center h-full"
                >
                  {/* Icon */}
                  <motion.div
                    className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {cat.icon}
                  </motion.div>

                  {/* Name */}
                  <div className="text-sm font-bold text-ink-800 group-hover:text-saffron-600 transition-colors mb-1 leading-tight">
                    {cat.nameEn}
                  </div>

                  {/* Hindi name */}
                  <div className="font-hindi text-xs text-ink-400 mb-2">
                    {cat.nameHi}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1 items-center">
                    {cat.count && (
                      <span className="text-xs font-semibold text-saffron-600 bg-saffron-100 px-2.5 py-0.5 rounded-full">
                        {cat.count} listed
                      </span>
                    )}
                    {cat.hasCalendar && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                        📅 Calendar
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ delay: 0.3 }}
        >
          <Link href="/categories" className="btn-ghost inline-flex">
            View all 66 categories
            <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
