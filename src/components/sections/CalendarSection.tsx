'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Search } from 'lucide-react'
import { cn, getDaysInMonth, getFirstDayOfMonth } from '@/lib/utils'
import { staggerContainer, fadeUp, fadeLeft, fadeRight, viewport } from '@/lib/animations'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TIME_SLOTS  = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

// Sample booked dates for demo
const BOOKED_DATES  = [5, 6, 12, 13, 19, 20, 26, 27]
const PARTIAL_DATES = [8, 15, 22]
const TODAY = 9

type DayStatus = 'available' | 'partial' | 'booked' | 'past' | 'empty'

export default function CalendarSection() {
  const now   = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedStart, setSelectedStart] = useState('')
  const [selectedEnd,   setSelectedEnd]   = useState('')

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const getDayStatus = (day: number): DayStatus => {
    if (day < TODAY && month === now.getMonth() && year === now.getFullYear()) return 'past'
    if (BOOKED_DATES.includes(day))  return 'booked'
    if (PARTIAL_DATES.includes(day)) return 'partial'
    return 'available'
  }

  const calendarDays = useMemo(() => {
    const days: { day: number | null; status: DayStatus }[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push({ day: null, status: 'empty' })
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, status: getDayStatus(d) })
    return days
  }, [year, month, daysInMonth, firstDayOfMonth])

  const dayStyles: Record<DayStatus, string> = {
    available: 'bg-green-50  text-green-700  border-green-200  hover:bg-green-500  hover:text-white hover:border-green-500 cursor-pointer',
    partial:   'bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-400  hover:text-white hover:border-amber-400 cursor-pointer',
    booked:    'bg-red-50    text-red-500    border-red-200    cursor-not-allowed opacity-70',
    past:      'bg-ink-50    text-ink-300    border-ink-100    cursor-not-allowed',
    empty:     'border-transparent',
  }

  const selectedStatus = selectedDate ? getDayStatus(selectedDate) : null

  return (
    <section id="calendar" className="py-24 bg-ink-50 overflow-hidden">
      <div className="container-main">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — content */}
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <motion.span variants={fadeUp} className="badge-section mb-4 block w-fit">
              📅 Live Availability
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mb-5">
              Book with
              <br />
              <span className="text-gradient-brand">confidence</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-ink-500 text-lg mb-8 leading-relaxed">
              No more calling 10 DJs to find who's free on your wedding date.
              Every service provider on My KKR shows their live calendar.
              Green is free, red is booked — see it all in 3 seconds.
            </motion.p>

            {/* Feature list */}
            <motion.ul variants={staggerContainer(0.08)} className="space-y-4 mb-8">
              {[
                { icon: '🔍', text: 'Search by your event date — see only available providers instantly' },
                { icon: '📅', text: 'Providers update their calendar in real time — always accurate' },
                { icon: '⏰', text: 'Set specific time slots — morning, evening, or custom hours' },
                { icon: '🎯', text: 'Compare 5 photographers on your date in under 30 seconds' },
                { icon: '💬', text: 'Once you find who\'s available, WhatsApp them directly' },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-ink-200 shadow-card hover:border-saffron-200 transition-all duration-200"
                >
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <span className="text-sm font-medium text-ink-700 leading-relaxed">{item.text}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Date search bar */}
            <motion.div variants={fadeUp} className="p-4 bg-white rounded-2xl border-2 border-saffron-200 shadow-brand-sm">
              <p className="text-xs font-bold text-saffron-600 uppercase tracking-wide mb-3">Quick availability search</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="date"
                  className="flex-1 min-w-0 input-field text-sm py-2.5"
                  min={new Date().toISOString().split('T')[0]}
                />
                <select className="input-field text-sm py-2.5 w-28">
                  {TIME_SLOTS.slice(0, 8).map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="input-field text-sm py-2.5 w-28">
                  {TIME_SLOTS.slice(2).map(t => <option key={t}>{t}</option>)}
                </select>
                <motion.button
                  className="btn-brand text-sm px-5 py-2.5 whitespace-nowrap"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Search size={15} />
                  Find free
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — interactive calendar */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <div className="bg-white rounded-3xl border border-ink-200 shadow-card-hover p-6">

              {/* Calendar header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-ink-900">
                    {MONTH_NAMES[month]} {year}
                  </h3>
                  <p className="text-xs text-ink-400 font-medium mt-0.5">
                    Sharma Sound & DJ — Availability
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={prevMonth}
                    className="w-9 h-9 rounded-xl border border-ink-200 flex items-center justify-center hover:border-saffron-400 hover:text-saffron-500 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  <motion.button
                    onClick={nextMonth}
                    className="w-9 h-9 rounded-xl border border-ink-200 flex items-center justify-center hover:border-saffron-400 hover:text-saffron-500 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-ink-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${year}-${month}`}
                  className="grid grid-cols-7 gap-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {calendarDays.map(({ day, status }, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        'aspect-square rounded-xl border flex items-center justify-center text-sm font-semibold transition-all duration-150',
                        dayStyles[status],
                        day === TODAY && month === now.getMonth() && 'ring-2 ring-saffron-400 ring-offset-1',
                        selectedDate === day && 'ring-2 ring-saffron-500 ring-offset-1 scale-110'
                      )}
                      onClick={() => {
                        if (day && status !== 'booked' && status !== 'past' && status !== 'empty') {
                          setSelectedDate(day === selectedDate ? null : day)
                        }
                      }}
                      whileHover={status === 'available' || status === 'partial' ? { scale: 1.1 } : {}}
                      whileTap={status === 'available' || status === 'partial' ? { scale: 0.95 } : {}}
                    >
                      {day}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Legend */}
              <div className="flex gap-4 mt-5 flex-wrap">
                {[
                  { color: 'bg-green-200', label: 'Available' },
                  { color: 'bg-amber-200', label: 'Partial' },
                  { color: 'bg-red-200',   label: 'Booked' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className="text-xs font-medium text-ink-500">{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Selected date detail */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div
                    className="mt-5 pt-5 border-t border-ink-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm font-bold text-ink-800 mb-3">
                      {selectedDate} {MONTH_NAMES[month]} — Available time slots
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['10:00–14:00', '15:00–20:00', '20:00–00:00'].map(slot => (
                        <motion.span
                          key={slot}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 cursor-pointer hover:bg-green-500 hover:text-white transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Clock size={11} />
                          {slot}
                        </motion.span>
                      ))}
                    </div>
                    <motion.button
                      className="mt-4 btn-brand w-full justify-center text-sm py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      💬 Contact on WhatsApp
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
