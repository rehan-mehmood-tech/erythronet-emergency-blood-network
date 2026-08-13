import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Clock, Heart, MapPin, ShieldCheck, User,
  AlertTriangle, Droplets, Activity
} from 'lucide-react'
import { backend } from '../lib/firebase'
import { BloodRequest } from '../types'
import { formatTimeAgo } from '../components/RequestCard'
import { useAuth } from '@/src/context/AuthContext'
import { useProtectedAction } from '@/src/hooks/useProtectedAction'

const ETA_OPTIONS = ['15 min', '30 min', '45 min', '60 min', '90 min']

function CountdownRing({ seconds }: { seconds: number }) {
  const total = 5400
  const pct = seconds / total
  const r = 48
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#F0D9DC" strokeWidth="5" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={seconds < 600 ? '#C1121F' : '#D99000'}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-lg font-bold text-[#171717]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {h > 0 ? `${h}:` : ''}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
        <div className="text-[10px] text-[#969696] font-medium">COMMITMENT</div>
      </div>
    </div>
  )
}

export default function RequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const protect = useProtectedAction()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEta, setSelectedEta] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [countdown, setCountdown] = useState(5400)

  useEffect(() => {
    return backend.subscribeToRequests((data) => {
      setRequests(data)
    })
  }, [])

  const request = requests.find((r) => r.id === id)
  const currentDonor = backend.getCurrentDonor()

  useEffect(() => {
    if (!request || request.status !== 'en-route') return
    
    const acceptedAt = request.acceptedAt || Date.now()
    const expiresAt = request.lockExpiresAt || (acceptedAt + 90 * 60 * 1000)
    
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
    }
    
    updateCountdown()
    const t = setInterval(updateCountdown, 1000)
    return () => clearInterval(t)
  }, [request?.status, request?.acceptedAt, request?.lockExpiresAt])

  const urgencyColor: Record<string, string> = {
    critical: 'text-[#C1121F]',
    urgent: 'text-[#D99000]',
    routine: 'text-[#168A55]',
  }

  const handleConfirm = async () => {
    if (!request || !user) return
    setConfirming(true)
    try {
      const donor = currentDonor || {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Authenticated Donor',
        phone: '03001234567',
        city: 'Lahore',
        district: 'Lahore Cantonment',
        bloodGroup: 'O+',
        notifications: [],
        totalDonations: 0,
        registeredAt: Date.now()
      }
      
      // If no donor profile has been registered yet, register this default profile
      if (!currentDonor) {
        await backend.registerDonor(donor)
      }

      await backend.acceptRequest(request.id, donor.name, selectedEta, donor.uid)
      setShowModal(false)
    } catch (err) {
      console.error("Confirm donor commitment error:", err)
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = async () => {
    if (!request) return
    setConfirming(true)
    try {
      await backend.cancelAcceptance(request.id)
    } catch (err) {
      console.error("Cancel commitment error:", err)
    } finally {
      setConfirming(false)
    }
  }

  const handleFulfill = async () => {
    if (!request) return
    setConfirming(true)
    try {
      await backend.fulfillRequest(request.id)
    } catch (err) {
      console.error("Fulfill request error:", err)
    } finally {
      setConfirming(false)
    }
  }

  if (!request) {
    return (
      <div className="pt-24 min-h-screen bg-[#FFF7F7] flex items-center justify-center">
        <div className="text-center">
          <span className="w-8 h-8 border-4 border-[#C1121F] border-t-transparent rounded-full animate-spin inline-block mb-2" />
          <p className="text-sm text-[#6B6B6B]">Loading request details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <Link to="/live-board" className="inline-flex items-center gap-2 text-[#6B6B6B] text-sm hover:text-[#171717] transition-colors mb-6">
          <ArrowLeft size={16} strokeWidth={2} />
          Back to Live Board
        </Link>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left: Request info */}
          <div className="space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${urgencyColor[request.urgency]}`}>
                    {request.urgency.toUpperCase()}
                  </span>
                  <h1 className="text-xl font-extrabold text-[#171717] mt-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Emergency Blood Request
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-extrabold text-[#C1121F] leading-none"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {request.bloodGroup}
                  </div>
                  <div className="text-xs font-semibold text-[#6B6B6B] mt-1 tracking-wide">
                    {request.units} UNIT{request.units > 1 ? 'S' : ''} REQUIRED
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Activity, label: 'Hospital', value: request.hospital },
                  { icon: MapPin, label: 'District', value: request.district },
                  { icon: Droplets, label: 'Ward', value: request.ward },
                  { icon: Clock, label: 'Requested', value: formatTimeAgo(request.createdAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-[#FFF7F7] rounded-xl p-3 border border-[#F0D9DC]">
                    <div className="w-7 h-7 bg-[#FDE8EA] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-[#C1121F]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#969696] uppercase">{label}</div>
                      <div className="text-sm font-semibold text-[#171717] mt-0.5">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification card */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-bold text-[#171717] mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Verification
              </h2>
              <div className="space-y-2.5">
                {[
                  { icon: ShieldCheck, text: 'Request verified by phone OTP', color: 'text-[#168A55]', bg: 'bg-green-50 border-green-100' },
                  { icon: CheckCircle, text: 'Hospital document attached for community accountability', color: 'text-[#168A55]', bg: 'bg-green-50 border-green-100' },
                  { icon: User, text: 'Requestor identity confirmed', color: 'text-[#168A55]', bg: 'bg-green-50 border-green-100' },
                ].map(({ icon: Icon, text, color, bg }) => (
                  <div key={text} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${bg}`}>
                    <Icon size={14} className={color} strokeWidth={2} />
                    <span className="text-xs font-medium text-[#171717]">{text}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#969696] mt-3 leading-relaxed">
                ErythroNet does not medically validate requests. Documents are attached for community accountability only.
              </p>
            </div>

            {/* Medical context */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <h2 className="text-sm font-bold text-[#171717] mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Medical Context
              </h2>
              <div className="flex gap-3">
                <span className="inline-block bg-[#FDE8EA] text-[#C1121F] text-xs font-semibold px-2.5 py-1 rounded-lg">Trauma</span>
                <span className="inline-block bg-[#FDE8EA] text-[#C1121F] text-xs font-semibold px-2.5 py-1 rounded-lg">Emergency</span>
              </div>
            </div>
          </div>

          {/* Right: Status panel */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border overflow-hidden"
              style={{
                borderColor: request.status === 'awaiting' ? '#F0D9DC' : request.status === 'en-route' ? '#fde68a' : '#a7f3d0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}>
              {/* Status header */}
              <div
                className={`px-5 py-4 border-b ${
                  request.status === 'awaiting'
                    ? 'bg-[#FDE8EA] border-[#F0D9DC]'
                    : request.status === 'en-route'
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-green-50 border-green-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      request.status === 'awaiting'
                        ? 'bg-[#C1121F] animate-live-dot'
                        : request.status === 'en-route'
                        ? 'bg-[#D99000]'
                        : 'bg-[#168A55]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold tracking-widest uppercase ${
                      request.status === 'awaiting'
                        ? 'text-[#C1121F]'
                        : request.status === 'en-route'
                        ? 'text-[#D99000]'
                        : 'text-[#168A55]'
                    }`}
                  >
                    {request.status === 'awaiting' ? 'Awaiting Donor' : request.status === 'en-route' ? 'Donor En Route' : 'Fulfilled'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {request.status === 'awaiting' && (
                  <>
                    <div className="text-center py-4 mb-4">
                      <div className="w-14 h-14 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Heart size={24} className="text-[#C1121F]" strokeWidth={2} />
                      </div>
                      <p className="text-sm text-[#6B6B6B]">Waiting for a nearby voluntary donor.</p>
                    </div>
                    <button
                      onClick={() => protect(() => setShowModal(true))}
                      className="btn-primary w-full justify-center py-3.5 text-sm rounded-xl cursor-pointer"
                    >
                      <Heart size={16} strokeWidth={2} />
                      I Will Donate
                    </button>
                    <div className="flex items-center gap-1.5 mt-3 justify-center">
                      <AlertTriangle size={12} className="text-[#D99000]" strokeWidth={2} />
                      <span className="text-[11px] text-[#969696]">Only commit if you are genuinely able to donate.</span>
                    </div>
                  </>
                )}

                {request.status === 'en-route' && (
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#D99000] tracking-widest uppercase mb-1">Donor Confirmed</p>
                    <div className="text-sm font-semibold text-[#171717] mb-4">
                      {request.donorName || 'Ahmed K.'} · ETA {request.donorEta || '30 min'}
                    </div>
                    <div className="flex justify-center mb-4">
                      <CountdownRing seconds={countdown} />
                    </div>
                    <p className="text-xs text-[#6B6B6B] mb-4">
                      Commitment window active. Donor has committed to reaching the hospital within the selected ETA.
                    </p>
                    
                    {/* Actions panel: visible to assigned donor, or open for demo mode if no donor is logged in */}
                    {(!user || user.uid === request.acceptedByDonorId) ? (
                      <div className="space-y-2 mt-4 pt-4 border-t border-[#E8E8E8]">
                        <button
                          onClick={handleFulfill}
                          disabled={confirming}
                          className="btn-primary bg-[#168A55] hover:bg-[#116e43] border-[#168A55] w-full justify-center py-2.5 text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle size={14} strokeWidth={2} />
                          Mark as Fulfilled
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={confirming}
                          className="btn-secondary border-[#F0D9DC] text-[#C1121F] hover:bg-[#FFF7F7] w-full justify-center py-2.5 text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          Cancel Commitment
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs font-medium text-[#D99000]">
                          Another donor is currently en route.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {request.status === 'fulfilled' && (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-green-100">
                      <CheckCircle size={26} className="text-[#168A55]" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-[#168A55] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Request Fulfilled
                    </h3>
                    <p className="text-sm text-[#6B6B6B]">Blood request successfully fulfilled. Thank you to the donor.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="mt-3 bg-[#FFF7F7] border border-[#F0D9DC] rounded-xl p-4 text-center">
              <p className="text-xs text-[#6B6B6B] mb-2">Share this request to reach more donors</p>
              <div className="flex gap-2 justify-center">
                <button className="btn-secondary text-xs py-1.5 px-3 rounded-lg">WhatsApp</button>
                <button className="btn-ghost text-xs py-1.5 px-3">Copy Link</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donor Acceptance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-[#E8E8E8] rounded-full mx-auto mb-6 sm:hidden" />
            <h2 className="text-xl font-extrabold text-[#171717] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              You're about to help.
            </h2>
            <p className="text-sm text-[#6B6B6B] mb-5">
              Estimated time to reach <strong>{request.hospital}</strong>?
            </p>
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {ETA_OPTIONS.map((eta) => (
                <button
                  key={eta}
                  onClick={() => setSelectedEta(eta)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedEta === eta
                      ? 'bg-[#C1121F] text-white shadow-md'
                      : 'bg-white border border-[#E8E8E8] text-[#171717] hover:bg-[#FDE8EA] hover:border-[#F0D9DC]'
                  }`}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: selectedEta === eta ? '0 4px 12px rgba(193,18,31,0.25)' : '2px 2px 6px rgba(193,18,31,0.05), -2px -2px 6px rgba(255,255,255,0.9)',
                  }}
                >
                  {eta}
                </button>
              ))}
            </div>
            <div className="bg-[#FFF7F7] border border-[#F0D9DC] rounded-xl p-3 mb-5">
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                By confirming, you commit to reaching the hospital within your selected ETA. Only proceed if you are medically eligible and genuinely available.
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedEta || confirming}
              className="btn-primary w-full justify-center py-3.5 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </span>
              ) : (
                <>
                  <CheckCircle size={16} strokeWidth={2} />
                  Confirm &amp; Go
                </>
              )}
            </button>
            <button onClick={() => setShowModal(false)} className="btn-ghost w-full justify-center mt-2 text-sm text-[#6B6B6B]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
