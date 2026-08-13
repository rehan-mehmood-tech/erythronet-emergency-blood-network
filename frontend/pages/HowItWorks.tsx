import { Link } from 'react-router-dom'
import { Activity, CheckCircle, Users, Droplets, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUpVariants, containerVariants } from '../lib/animations'
import MagneticButton from '../components/MagneticButton'

const STEPS = [
  {
    num: '01',
    icon: Activity,
    title: 'Request',
    desc: 'A patient attendant submits an emergency blood request with hospital details, blood group, ward, and units required. Phone OTP and a hospital document are required for community accountability.',
    detail: 'This ensures every request on the board is genuine — no anonymous panic broadcasts.',
  },
  {
    num: '02',
    icon: CheckCircle,
    title: 'Verify',
    desc: 'The request is published to the Live Board after phone verification and document attachment. No medical certification — just accountability.',
    detail: 'Verification reduces noise and builds trust with potential donors.',
  },
  {
    num: '03',
    icon: Users,
    title: 'Match',
    desc: 'Registered voluntary donors in the same city and district receive an immediate notification via their preferred channel — WhatsApp, SMS, or push.',
    detail: 'District-level matching means notifications go to donors who can actually reach the hospital in time.',
  },
  {
    num: '04',
    icon: Droplets,
    title: 'Donate',
    desc: 'A donor reviews the request, selects an ETA, and commits. The request status updates to "Donor En Route" — visible to the patient attendant in real time.',
    detail: "The commitment window creates accountability. The donor's ETA is visible on the request detail.",
  },
  {
    num: '05',
    icon: CheckCircle,
    title: 'Fulfill',
    desc: 'Once the donation is complete, the request is marked fulfilled. The response time is logged for the Impact Dashboard.',
    detail: 'Every fulfilled request contributes to public transparency data.',
  },
]

const WHATSAPP_VS = [
  { label: 'Structure', whatsapp: 'Unstructured messages', erythro: 'Verified structured request' },
  { label: 'Status', whatsapp: 'No real-time status', erythro: 'Live state transitions' },
  { label: 'Verification', whatsapp: 'No verification', erythro: 'Phone OTP + document' },
  { label: 'Matching', whatsapp: 'Broadcast to everyone', erythro: 'District-level donor matching' },
  { label: 'ETA', whatsapp: 'No commitment system', erythro: 'Donor ETA + countdown' },
  { label: 'History', whatsapp: 'Lost in chat', erythro: 'Permanent impact record' },
]

export default function HowItWorks() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-[#FFF7F7] border-b border-[#F0D9DC]"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
          <motion.span variants={fadeUpVariants} className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Process</motion.span>
          <motion.h1
            variants={fadeUpVariants}
            className="text-3xl sm:text-4xl font-extrabold text-[#171717] mt-2 mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            How ErythroNet Works
          </motion.h1>
          <motion.p variants={fadeUpVariants} className="text-[#6B6B6B] text-base max-w-[520px]">
            A structured, accountable process designed for emergency situations — not for normal blood drives.
          </motion.p>
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="max-w-[860px] mx-auto px-4 sm:px-6 py-14"
      >
        <div className="relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-[#F0D9DC] md:block hidden" />
          <motion.div variants={containerVariants} className="space-y-12">
            {STEPS.map(({ num, icon: Icon, title, desc, detail }) => (
              <motion.div key={num} variants={fadeUpVariants} className="flex gap-6 md:gap-8 items-start">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-14 h-14 bg-white border-2 border-[#F0D9DC] rounded-2xl flex items-center justify-center"
                    style={{ boxShadow: '0 2px 10px rgba(193,18,31,0.08)' }}>
                    <Icon size={22} className="text-[#C1121F]" strokeWidth={2} />
                  </div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold tracking-widest text-[#969696]">{num}</span>
                    <h2 className="text-xl font-extrabold text-[#171717]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
                  </div>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed mb-2">{desc}</p>
                  <p className="text-xs text-[#C1121F] font-medium">{detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Why not WhatsApp */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="bg-[#FFF7F7] border-y border-[#F0D9DC] py-14"
      >
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <motion.h2
            variants={fadeUpVariants}
            className="text-2xl font-extrabold text-[#171717] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Why not WhatsApp?
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-sm text-[#6B6B6B] mb-8">
            WhatsApp blood broadcasts are well-intentioned. ErythroNet adds structure, accountability, and real-time coordination on top.
          </motion.p>
          <motion.div
            variants={fadeUpVariants}
            className="bg-white rounded-2xl border border-[#E8E8E8] overflow-x-auto no-scrollbar"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[1fr_1fr_1fr] text-xs font-bold uppercase tracking-wider border-b border-[#E8E8E8]">
                <div className="p-4 text-[#969696]">Feature</div>
                <div className="p-4 text-[#6B6B6B] border-x border-[#E8E8E8]">WhatsApp</div>
                <div className="p-4 text-[#C1121F]">ErythroNet</div>
              </div>
              {WHATSAPP_VS.map(({ label, whatsapp, erythro }) => (
                <div key={label} className="grid grid-cols-[1fr_1fr_1fr] text-sm border-b border-[#E8E8E8] last:border-0">
                  <div className="p-4 font-medium text-[#171717] text-xs">{label}</div>
                  <div className="p-4 border-x border-[#E8E8E8]">
                    <div className="flex items-center gap-1.5 text-[#969696] text-xs">
                      <X size={12} className="text-[#969696] flex-shrink-0" strokeWidth={2} />
                      {whatsapp}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[#168A55] text-xs">
                      <CheckCircle size={12} className="flex-shrink-0" strokeWidth={2} />
                      {erythro}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
        className="py-14"
      >
        <div className="max-w-[640px] mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            variants={fadeUpVariants}
            className="text-2xl font-extrabold text-[#171717] mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ready to help?
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-[#6B6B6B] text-sm mb-6">
            Register as a donor and receive notifications for emergencies in your area.
          </motion.p>
          <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-3 justify-center">
            <MagneticButton>
              <Link to="/donor/register" className="btn-primary justify-center py-3 px-7">
                <Droplets size={15} strokeWidth={2} />
                Become a Donor
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/live-board" className="btn-secondary justify-center py-3 px-7">
                View Live Board
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
