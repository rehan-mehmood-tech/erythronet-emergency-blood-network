import { useEffect, useState } from 'react'
import { Activity, CheckCircle, Clock, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { backend } from '../lib/firebase'
import { fadeUpVariants, containerVariants } from '../lib/animations'
import AnimatedCounter from '../components/AnimatedCounter'
import InteractiveCard from '../components/InteractiveCard'

const CITY_DATA = [
  { city: 'Lahore', count: 342, pct: 100 },
  { city: 'Karachi', count: 289, pct: 84 },
  { city: 'Islamabad', count: 156, pct: 46 },
  { city: 'Rawalpindi', count: 60, pct: 18 },
]

const BLOOD_DATA = [
  { group: 'O+', demand: 85, donors: 62 },
  { group: 'A+', demand: 70, donors: 58 },
  { group: 'B+', demand: 55, donors: 45 },
  { group: 'AB+', demand: 40, donors: 30 },
  { group: 'O-', demand: 35, donors: 20 },
  { group: 'A-', demand: 28, donors: 22 },
  { group: 'B-', demand: 22, donors: 15 },
  { group: 'AB-', demand: 15, donors: 8 },
]

const MONTHLY = [
  { month: 'Feb', count: 48 },
  { month: 'Mar', count: 65 },
  { month: 'Apr', count: 72 },
  { month: 'May', count: 90 },
  { month: 'Jun', count: 103 },
  { month: 'Jul', count: 118 },
  { month: 'Aug', count: 87 },
]

export default function ImpactDashboard() {
  const [visible, setVisible] = useState(false)
  const [metrics, setMetrics] = useState({ totalFulfilled: 840, totalDonors: 2420, avgResponseMinutes: 34 })

  useEffect(() => {
    backend.getMetrics().then(setMetrics).catch(() => {})
  }, [])


  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white border-b border-[#F0D9DC]"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <motion.span variants={fadeUpVariants} className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Public Dashboard</motion.span>
          <motion.h1
            variants={fadeUpVariants}
            className="text-3xl font-extrabold text-[#171717] mt-1 mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Every response closes a gap.
          </motion.h1>
          <motion.p variants={fadeUpVariants} className="text-[#6B6B6B] text-sm">Real-time transparency into ErythroNet's emergency network impact.</motion.p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        onViewportEnter={() => setVisible(true)}
        className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6"
      >
        {/* Key metrics */}
        <motion.div variants={containerVariants} className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle, label: 'Requests Fulfilled', value: metrics.totalFulfilled, unit: '', color: 'text-[#168A55]', bg: 'bg-green-50' },
            { icon: Clock, label: 'Average Response Time', value: metrics.avgResponseMinutes, unit: ' min', color: 'text-[#D99000]', bg: 'bg-amber-50' },
            { icon: Users, label: 'Registered Donors', value: metrics.totalDonors, unit: '', color: 'text-[#C1121F]', bg: 'bg-[#FDE8EA]' },
          ].map(({ icon: Icon, label, value, unit, color, bg }) => (
            <motion.div key={label} variants={fadeUpVariants}>
              <InteractiveCard
                className="bg-white rounded-2xl border border-[#E8E8E8] p-5 h-full"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5`}>
                  <Icon size={16} className={color} strokeWidth={2} />
                </div>
                <div className={`text-4xl font-extrabold ${color} leading-none mb-1 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 origin-left`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <AnimatedCounter value={value} suffix={unit} />
                </div>
                <div className="text-xs text-[#6B6B6B] font-medium">{label}</div>
              </InteractiveCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={containerVariants} className="grid lg:grid-cols-2 gap-5">
          {/* Requests by city */}
          <motion.div variants={fadeUpVariants}>
            <InteractiveCard
              className="bg-white rounded-2xl border border-[#E8E8E8] p-5 h-full"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <h2 className="text-sm font-bold text-[#171717] mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Fulfilled Requests by City
              </h2>
              <div className="space-y-3">
                {CITY_DATA.map(({ city, count, pct }) => (
                  <div key={city}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[#171717]">{city}</span>
                      <span className="font-bold text-[#C1121F]">{count}</span>
                    </div>
                    <div className="h-2 bg-[#FDE8EA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C1121F] rounded-full transition-all duration-1000"
                        style={{ width: visible ? `${pct}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </InteractiveCard>
          </motion.div>

          {/* Blood group demand vs supply */}
          <motion.div variants={fadeUpVariants}>
            <InteractiveCard
              className="bg-white rounded-2xl border border-[#E8E8E8] p-5 h-full"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <h2 className="text-sm font-bold text-[#171717] mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Blood Group Demand vs. Donors
              </h2>
              <p className="text-[11px] text-[#969696] mb-4">
                <span className="font-semibold text-[#C1121F]">O+</span> is currently the most requested blood group.
              </p>
              <div className="space-y-2.5">
                {BLOOD_DATA.map(({ group, demand, donors: d }) => (
                  <div key={group} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#C1121F] w-8"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{group}</span>
                    <div className="flex-1 flex gap-1 items-center">
                      <div className="flex-1 h-1.5 bg-[#FDE8EA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C1121F] rounded-full transition-all duration-1000"
                          style={{ width: visible ? `${demand}%` : '0%' }} />
                      </div>
                      <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#168A55] rounded-full transition-all duration-1000"
                          style={{ width: visible ? `${d}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-[#969696]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C1121F]" />Demand</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#168A55]" />Donors</span>
              </div>
            </InteractiveCard>
          </motion.div>
        </motion.div>

        {/* Monthly chart */}
        <motion.div variants={fadeUpVariants}>
          <InteractiveCard
            className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-[#171717]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monthly Fulfilled Requests</h2>
                <p className="text-[11px] text-[#969696] mt-0.5">Showing 2025 — steady growth in donor response.</p>
              </div>
              <div className="flex items-center gap-1.5 text-[#C1121F]">
                <Activity size={14} strokeWidth={2} />
                <span className="text-xs font-bold">+23% MoM</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-28">
              {MONTHLY.map(({ month, count }) => {
                const maxCount = Math.max(...MONTHLY.map((m) => m.count))
                const h = (count / maxCount) * 100
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-[#C1121F] font-bold">{count}</span>
                    <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-[#C1121F] rounded-t-lg transition-all duration-1000"
                        style={{ height: visible ? `${h}%` : '0%', marginTop: 'auto' }}
                      />
                    </div>
                    <span className="text-[10px] text-[#969696]">{month}</span>
                  </div>
                )
              })}
            </div>
          </InteractiveCard>
        </motion.div>

        {/* Top districts */}
        <motion.div
          variants={fadeUpVariants}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-sm font-bold text-[#171717] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Top Responding Districts</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { rank: '01', district: 'Lahore Cantonment', count: 94, city: 'Lahore' },
              { rank: '02', district: 'Karachi South', count: 87, city: 'Karachi' },
              { rank: '03', district: 'Gulberg', count: 72, city: 'Lahore' },
              { rank: '04', district: 'G-8 / G-9', count: 65, city: 'Islamabad' },
              { rank: '05', district: 'DHA Karachi', count: 58, city: 'Karachi' },
              { rank: '06', district: 'DHA Lahore', count: 51, city: 'Lahore' },
            ].map(({ rank, district, count, city }) => (
              <InteractiveCard key={rank} className="flex items-center gap-3 p-3 bg-[#FFF7F7] rounded-xl border border-[#F0D9DC]">
                <span className="text-xs font-bold text-[#969696] w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">{rank}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#171717] transition-transform duration-300 group-hover:-translate-y-0.5">{district}</div>
                  <div className="text-[11px] text-[#969696]">{city}</div>
                </div>
                <div className="text-sm font-extrabold text-[#C1121F] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{count}</div>
              </InteractiveCard>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
