import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowRight, CheckCircle, Clock, Droplets, HeartPulse,
  MapPin, ShieldCheck, Users, Zap, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import RequestCard, { formatTimeAgo } from '../components/RequestCard'
import { backend, requestNotificationPermission } from '../lib/firebase'
import { fadeUpVariants, containerVariants } from '../lib/animations'
import AnimatedCounter from '../components/AnimatedCounter'
import InteractiveCard from '../components/InteractiveCard'
import MagneticButton from '../components/MagneticButton'
import Auralis from '../components/ui/auralis'
import GradientBlobCard from '../components/ui/gradient-bold-card'
import MythsSection from '../components/MythsSection'

function StatCard({ num, suffix, label, sub }: {
  num: number; suffix?: string; label: string; sub: string
}) {
  const decimals = num % 1 !== 0 ? 1 : 0

  return (
    <motion.div variants={fadeUpVariants}>
      <InteractiveCard
        className="bg-white rounded-2xl p-6 border border-[#E8E8E8] h-full"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
      >
        <div className="mb-3 w-8 h-0.5 bg-[#C1121F] rounded-full transition-transform duration-300 group-hover:scale-x-125 origin-left" />
        <div className="flex items-end gap-0.5 mb-1 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 origin-left">
          <span
            className="text-5xl font-extrabold text-[#171717] leading-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <AnimatedCounter value={num} decimals={decimals} suffix={suffix} />
          </span>
        </div>
        <div className="text-sm font-semibold text-[#171717] mt-2 mb-1 transition-transform duration-300 group-hover:-translate-y-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </div>
        <div className="text-xs text-[#969696]">{sub}</div>
      </InteractiveCard>
    </motion.div>
  )
}

const mockRequests = [
  {
    id: 'req-001',
    hospital: 'Jinnah Hospital',
    bloodGroup: 'O+',
    urgency: 'Critical',
    location: 'Lahore Cantonment · Ward 3',
  },
  {
    id: 'req-002',
    hospital: 'Mayo Hospital',
    bloodGroup: 'A-',
    urgency: 'Urgent',
    location: 'Old Anarkali · ICU',
  },
  {
    id: 'req-003',
    hospital: 'Services Hospital',
    bloodGroup: 'B+',
    urgency: 'Critical',
    location: 'Gulberg · Ward 2',
  },
  {
    id: 'req-004',
    hospital: 'LGH Hospital',
    bloodGroup: 'AB-',
    urgency: 'Routine',
    location: 'Ferozepur Road · Emergency Room',
  },
  {
    id: 'req-005',
    hospital: 'PIMS Hospital',
    bloodGroup: 'O-',
    urgency: 'Critical',
    location: 'G-8, Islamabad · ICU Bed 5',
  }
]

function HowStep({ step, icon: Icon, title, desc, statusColor, statusLabel, showConnector }: {
  step: string; icon: React.ElementType; title: string; desc: string; statusColor: string; statusLabel: string; showConnector?: boolean
}) {
  return (
    <motion.div variants={fadeUpVariants} className="flex flex-col items-start relative w-full">
      {showConnector && (
        <div className="absolute top-[20px] left-[48px] right-[-80px] h-px bg-[#F0D9DC] z-0 pointer-events-none md:block hidden overflow-hidden">
          {step === '01' && (
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#C1121F] to-[#FDE8EA]" />
          )}
        </div>
      )}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <span className="text-xs font-bold tracking-widest text-[#969696]">{step}</span>
        <div className="w-10 h-10 rounded-xl bg-[#FFF7F7] border border-[#F0D9DC] flex items-center justify-center">
          <Icon size={18} className="text-[#C1121F]" strokeWidth={2} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-[#171717] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h3>
      <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{desc}</p>
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor} animate-breath`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {statusLabel}
      </span>
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    requestNotificationPermission()
    return backend.subscribeToRequests((data) => {
      setRequests(data)
    })
  }, [])

  const liveCount = requests.filter((r) => r.status === 'awaiting').length

  return (
    <div className="pt-16">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-[#0a0203]"
      >
        {/* WebGL Auralis Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Auralis speed={0.25} grain={0.3} colors={["#991b1b", "#dc2626", "#7f1d1d"]} />
        </div>

        {/* Atmospheric glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(193,18,31,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Subtle network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none z-0" viewBox="0 0 1440 800" fill="none">
          <line x1="200" y1="100" x2="600" y2="400" stroke="white" strokeWidth="1" />
          <line x1="600" y1="400" x2="1100" y2="200" stroke="white" strokeWidth="1" />
          <line x1="600" y1="400" x2="800" y2="650" stroke="white" strokeWidth="1" />
          <line x1="100" y1="550" x2="600" y2="400" stroke="white" strokeWidth="1" />
          <line x1="1100" y1="200" x2="1350" y2="500" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="100" r="4" fill="white" />
          <circle cx="600" cy="400" r="6" fill="white" />
          <circle cx="1100" cy="200" r="4" fill="white" />
          <circle cx="800" cy="650" r="3" fill="white" />
          <circle cx="100" cy="550" r="3" fill="white" />
          <circle cx="1350" cy="500" r="4" fill="white" />
        </svg>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-16 w-full z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div variants={containerVariants} className="flex flex-col items-start">
              <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-breath">
                <span className="w-2 h-2 rounded-full bg-[#C1121F] animate-live-dot" />
                <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">
                  Live Emergency Blood Network
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUpVariants}
                className="text-[2.75rem] sm:text-[3.5rem] font-extrabold text-white leading-[1.08] mb-6"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Emergency Blood.<br />
                <span className="text-[#FDE8EA]">Found in Minutes,</span><br />
                Not Hours.
              </motion.h1>

              <motion.p variants={fadeUpVariants} className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 max-w-[480px]">
                Pakistan needs 5 million blood donations a year. Only 2.7 million are collected. The gap kills people who have willing donors in the same city — but no way to find them.{" "}
                <a 
                  href="https://www.emro.who.int/pak/pakistan-news/pakistan-faces-an-annual-deficit-of-2-3-million-blood-donations-who-calls-on-voluntary-donors-to-save-lives.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#FDE8EA] font-semibold underline hover:text-white transition-colors inline-flex items-center gap-0.5"
                >
                  [WHO EMRO, June 2026 ↗]
                </a>
              </motion.p>

              <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-3 mb-10">
                <MagneticButton>
                  <Link
                    to="/request/new"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#C1121F] font-bold text-sm px-6 py-3.5 rounded-[10px] transition-all hover:bg-[#FDE8EA]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <Activity size={16} strokeWidth={2.5} />
                    Request Emergency Blood
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    to="/donor/register"
                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-6 py-3.5 rounded-[10px] transition-all hover:bg-white/10"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Become a Donor
                    <ArrowRight size={15} strokeWidth={2} />
                  </Link>
                </MagneticButton>
              </motion.div>

              <motion.div variants={fadeUpVariants} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Live Now</span>
                </div>
                <span className="text-white/90 text-sm">
                  <span className="font-bold text-white">{liveCount} active requests</span> across Lahore, Karachi &amp; Islamabad
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Floating request card stack */}
            <motion.div variants={fadeUpVariants} className="hidden lg:flex justify-center items-center relative">
              <div className="relative w-full max-w-sm cursor-pointer" onClick={() => setActiveIndex((prev) => (prev + 1) % mockRequests.length)}>
                {/* Stack Layer 2 (Deep Back) */}
                <div className="absolute top-4 left-4 h-full w-full rounded-2xl bg-red-950/40 border border-red-800/20 shadow-lg transform rotate-6 scale-95 transition-all duration-300 pointer-events-none" />
                
                {/* Stack Layer 1 (Middle Back) */}
                <div className="absolute top-2 left-2 h-full w-full rounded-2xl bg-neutral-900/60 border border-red-700/30 shadow-xl transform -rotate-3 scale-98 transition-all duration-300 pointer-events-none" />

                {/* Active Foreground Card with Animated Blob */}
                <GradientBlobCard className="relative z-10">
                  <div className="flex items-center justify-between text-left">
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20 animate-pulse">
                      • {mockRequests[activeIndex].urgency}
                    </span>
                    <span className="text-2xl font-bold text-red-500">
                      {mockRequests[activeIndex].bloodGroup}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-white text-left">
                    {mockRequests[activeIndex].hospital}
                  </h3>
                  <p className="text-xs text-neutral-400 text-left">
                    {mockRequests[activeIndex].location}
                  </p>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-left">
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      ✓ Verified Request
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/request/${mockRequests[activeIndex].id}`);
                      }}
                      className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-medium text-white shadow-md transition-colors"
                    >
                      I Will Donate
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] text-center text-neutral-500">
                    Click card to cycle active requests ({activeIndex + 1}/{mockRequests.length})
                  </p>
                </GradientBlobCard>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="bg-[#FFF7F7] py-20 border-y border-[#F0D9DC]"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUpVariants} className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">The Crisis</span>
            <h2 className="text-3xl font-extrabold text-[#171717] mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Pakistan's Blood Gap
            </h2>
          </motion.div>
          <motion.div variants={containerVariants} className="grid sm:grid-cols-3 gap-5">
            <StatCard num={2.3} suffix="M" label="Annual donation deficit" sub="Pakistan needs 2.3M more donors per year" />
            <StatCard num={82} suffix="%" label="Family/replacement dependency" sub="Most hospitals rely on non-voluntary donors" />
            <StatCard num={100} suffix="K+" label="Thalassemia patients" sub="Require regular transfusions to survive" />
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="py-20 bg-white"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUpVariants} className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Process</span>
            <h2 className="text-3xl font-extrabold text-[#171717] mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              How ErythroNet Works
            </h2>
          </motion.div>

          {/* Desktop: horizontal */}
          <motion.div variants={containerVariants} className="hidden md:grid grid-cols-3 gap-8 relative">
            <HowStep step="01" icon={Activity} title="Request" desc="Submit a verified emergency blood request with hospital details, blood group, and units required." statusColor="bg-[#FDE8EA] text-[#C1121F]" statusLabel="Request Live" showConnector={true} />
            <HowStep step="02" icon={Users} title="Match" desc="Nearby verified voluntary donors in the same district receive an immediate notification." statusColor="bg-amber-50 text-[#D99000]" statusLabel="Matching Donors" showConnector={true} />
            <HowStep step="03" icon={CheckCircle} title="Resolve" desc="A donor accepts, commits to an ETA, and the request status updates in real time." statusColor="bg-green-50 text-[#168A55]" statusLabel="Fulfilled" />
          </motion.div>

          {/* Mobile: vertical */}
          <motion.div variants={containerVariants} className="md:hidden flex flex-col gap-8 relative pl-6">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-[#F0D9DC]" />
            {[
              { step: '01', icon: Activity, title: 'Request', desc: 'Submit a verified emergency request with hospital details and blood type.' },
              { step: '02', icon: Users, title: 'Match', desc: 'Nearby voluntary donors receive an immediate notification.' },
              { step: '03', icon: CheckCircle, title: 'Resolve', desc: 'Donor accepts, commits to ETA, request is fulfilled.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} variants={fadeUpVariants} className="flex gap-4 relative">
                <div className="absolute left-[-30px] w-4.5 h-4.5 rounded-full bg-[#C1121F] border-2 border-white" style={{ marginTop: '3px' }} />
                <div>
                  <span className="text-xs font-bold tracking-widest text-[#969696]">{step}</span>
                  <h3 className="text-base font-bold text-[#171717] mt-1 mb-1">{title}</h3>
                  <p className="text-sm text-[#6B6B6B]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Live Board Preview */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="py-20 bg-[#FFF7F7] border-y border-[#F0D9DC]"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#C1121F] animate-live-dot" />
                <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Live Now</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[#171717]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Active Blood Requests
              </h2>
              <p className="text-[#6B6B6B] text-sm mt-1">Verified requests currently seeking donors.</p>
            </div>
            <MagneticButton>
              <Link to="/live-board" className="btn-secondary text-sm">
                View Full Board <ChevronRight size={15} strokeWidth={2} />
              </Link>
            </MagneticButton>
          </motion.div>
          <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(requests.filter((r) => r.status !== 'fulfilled').length > 0
              ? requests.filter((r) => r.status !== 'fulfilled')
              : requests
            ).slice(0, 3).map((r) => (
              <motion.div key={r.id} variants={fadeUpVariants}>
                <RequestCard data={r} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="py-20 bg-white"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUpVariants} className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Trust & Safety</span>
            <h2 className="text-3xl font-extrabold text-[#171717] mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Built for Accountability
            </h2>
            <p className="text-[#6B6B6B] text-sm mt-2 max-w-md mx-auto">
              Every request requires phone verification and a hospital document. Not medical certification — community accountability.
            </p>
          </motion.div>
          <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: ShieldCheck, title: 'Phone Verified', desc: 'Every requestor confirms via OTP before publishing.' },
              { icon: CheckCircle, title: 'Hospital Slip', desc: 'Blood order or admission document attached to each request.' },
              { icon: HeartPulse, title: 'Real-Time Status', desc: 'Live state transitions — Awaiting, En Route, Fulfilled.' },
              { icon: Zap, title: 'District Matching', desc: 'Requests matched to donors by city and district for fastest response.' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUpVariants}>
                <InteractiveCard className="bg-[#FFF7F7] border border-[#F0D9DC] rounded-2xl p-5 h-full">
                  <div className="w-9 h-9 bg-[#FDE8EA] rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                    <Icon size={18} className="text-[#C1121F]" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold text-[#171717] mb-1 transition-transform duration-300 group-hover:-translate-y-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{desc}</p>
                </InteractiveCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Myths vs Reality Section */}
      <MythsSection />

      {/* Final CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0305 0%, #2d0509 50%, #8F0D17 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(193,18,31,0.25) 0%, transparent 70%)' }} />
        <div className="relative max-w-[640px] mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={fadeUpVariants} className="flex items-center justify-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Emergency Blood Network</span>
          </motion.div>
          <motion.h2
            variants={fadeUpVariants}
            className="text-[2.5rem] font-extrabold text-white leading-tight mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            If someone you care about needed blood right now —
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-white/65 text-base mb-8">
            Be the reason they find a donor in minutes, not hours.
          </motion.p>
          <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-3 justify-center">
            <MagneticButton>
              <Link
                to="/request/new"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#C1121F] font-bold text-sm px-7 py-3.5 rounded-[10px] transition-all hover:bg-[#FDE8EA]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Activity size={16} strokeWidth={2.5} />
                Request Emergency Blood
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                to="/donor/register"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-[10px] hover:bg-white/10"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Droplets size={15} strokeWidth={2} />
                Register as Donor
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUpVariants}
        className="bg-[#171717] py-10"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#C1121F] rounded-lg flex items-center justify-center">
                <Droplets size={14} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ErythroNet <span className="text-white/40 font-normal">· Emergency Blood Network</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/live-board" className="text-white/50 text-xs hover:text-white/80 transition-colors">Live Board</Link>
              <Link to="/how-it-works" className="text-white/50 text-xs hover:text-white/80 transition-colors">How It Works</Link>
              <Link to="/impact" className="text-white/50 text-xs hover:text-white/80 transition-colors">Impact</Link>
            </div>
            <div className="text-white/30 text-xs">Pakistan · Emergency Blood Coordination</div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
