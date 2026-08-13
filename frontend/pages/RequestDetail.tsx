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

const checkCompatibility = (donor: string, recipient: string): boolean => {
  const d = donor.trim().toUpperCase();
  const r = recipient.trim().toUpperCase();

  if (d === 'O-') return true;
  if (d === 'O+') return ['O+', 'A+', 'B+', 'AB+'].includes(r);
  if (d === 'A-') return ['A-', 'A+', 'AB-', 'AB+'].includes(r);
  if (d === 'A+') return ['A+', 'AB+'].includes(r);
  if (d === 'B-') return ['B-', 'B+', 'AB-', 'AB+'].includes(r);
  if (d === 'B+') return ['B+', 'AB+'].includes(r);
  if (d === 'AB-') return ['AB-', 'AB+'].includes(r);
  if (d === 'AB+') return r === 'AB+';
  return false;
};

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = total > 0 ? seconds / total : 0
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
  const [showMismatchModal, setShowMismatchModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
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

  // Reset local states when navigating to a different request ID to avoid leaks
  useEffect(() => {
    setShowModal(false)
    setShowMismatchModal(false)
    setSelectedEta('')
    setConfirming(false)
  }, [id])

  // Load and merge local commitment state if exists
  const localCommitmentStr = id ? localStorage.getItem(`commitment_${id}`) : null
  const localCommitment = localCommitmentStr ? JSON.parse(localCommitmentStr) : null

  const requestData = request ? { ...request } : null
  if (requestData && localCommitment) {
    const isExpired = Date.now() > new Date(localCommitment.lockExpiresAt).getTime()
    if (!isExpired) {
      if (requestData.status === 'awaiting') {
        requestData.status = 'en-route'
        requestData.donorName = localCommitment.donorName
        requestData.donorEta = localCommitment.donorEta
        requestData.acceptedByDonorId = localCommitment.acceptedByDonorId
        requestData.acceptedAt = localCommitment.acceptedAt
        requestData.lockExpiresAt = localCommitment.lockExpiresAt
      }
    } else {
      if (id) {
        localStorage.removeItem(`commitment_${id}`)
      }
    }
  }

  // Dynamic commitment total seconds calculation
  const etaMinutes = requestData?.donorEta ? parseInt(requestData.donorEta) : 90
  const totalSeconds = etaMinutes * 60

  useEffect(() => {
    if (!requestData || requestData.status !== 'en-route') return
    
    const acceptedAt = requestData.acceptedAt ? new Date(requestData.acceptedAt).getTime() : Date.now()
    const currentEtaMin = requestData.donorEta ? parseInt(requestData.donorEta) : 90
    const expiresAt = requestData.lockExpiresAt ? new Date(requestData.lockExpiresAt).getTime() : (acceptedAt + currentEtaMin * 60 * 1000)
    
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
    }
    
    updateCountdown()
    const t = setInterval(updateCountdown, 1000)
    return () => clearInterval(t)
  }, [requestData?.status, requestData?.acceptedAt, requestData?.lockExpiresAt, requestData?.donorEta, id])

  const urgencyColor: Record<string, string> = {
    critical: 'text-[#C1121F]',
    urgent: 'text-[#D99000]',
    routine: 'text-[#168A55]',
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const handleConfirm = async () => {
    if (!requestData || !user) return
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

      await backend.acceptRequest(requestData.id, donor.name, selectedEta, donor.uid)
      
      // Scope commitment state and local storage keys strictly to the current requestId
      const etaMin = parseInt(selectedEta) || 90
      localStorage.setItem(`commitment_${requestData.id}`, JSON.stringify({
        status: 'en-route',
        donorName: donor.name,
        donorEta: selectedEta,
        acceptedByDonorId: donor.uid,
        acceptedAt: new Date().toISOString(),
        lockExpiresAt: new Date(Date.now() + etaMin * 60 * 1000).toISOString()
      }))

      setShowModal(false)
    } catch (err) {
      console.error("Confirm donor commitment error:", err)
    } finally {
      setConfirming(false)
    }
  }

  const handleCancel = async () => {
    if (!requestData) return
    setConfirming(true)
    try {
      await backend.cancelAcceptance(requestData.id)
      localStorage.removeItem(`commitment_${requestData.id}`)
    } catch (err) {
      console.error("Cancel commitment error:", err)
    } finally {
      setConfirming(false)
    }
  }

  const handleFulfill = async () => {
    if (!requestData) return
    setConfirming(true)
    try {
      await backend.fulfillRequest(requestData.id)
      localStorage.removeItem(`commitment_${requestData.id}`)
    } catch (err) {
      console.error("Fulfill request error:", err)
    } finally {
      setConfirming(false)
    }
  }

  if (!requestData) {
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
                  <span className={`text-xs font-bold tracking-widest uppercase ${urgencyColor[requestData.urgency]}`}>
                    {requestData.urgency.toUpperCase()}
                  </span>
                  <h1 className="text-xl font-extrabold text-[#171717] mt-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Emergency Blood Request
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-extrabold text-[#C1121F] leading-none"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {requestData.bloodGroup}
                  </div>
                  <div className="text-xs font-semibold text-[#6B6B6B] mt-1 tracking-wide">
                    {requestData.units} UNIT{requestData.units > 1 ? 'S' : ''} REQUIRED
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Activity, label: 'Hospital', value: requestData.hospital },
                  { icon: MapPin, label: 'District', value: requestData.district },
                  { icon: Droplets, label: 'Ward', value: requestData.ward },
                  { icon: Clock, label: 'Requested', value: formatTimeAgo(requestData.createdAt) },
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
                borderColor: requestData.status === 'awaiting' ? '#F0D9DC' : requestData.status === 'en-route' ? '#fde68a' : '#a7f3d0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}>
              {/* Status header */}
              <div
                className={`px-5 py-4 border-b ${
                  requestData.status === 'awaiting'
                    ? 'bg-[#FDE8EA] border-[#F0D9DC]'
                    : requestData.status === 'en-route'
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-green-50 border-green-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      requestData.status === 'awaiting'
                        ? 'bg-[#C1121F] animate-live-dot'
                        : requestData.status === 'en-route'
                        ? 'bg-[#D99000]'
                        : 'bg-[#168A55]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold tracking-widest uppercase ${
                      requestData.status === 'awaiting'
                        ? 'text-[#C1121F]'
                        : requestData.status === 'en-route'
                        ? 'text-[#D99000]'
                        : 'text-[#168A55]'
                    }`}
                  >
                    {requestData.status === 'awaiting' ? 'Awaiting Donor' : requestData.status === 'en-route' ? 'Donor En Route' : 'Fulfilled'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {requestData.status === 'awaiting' && (
                  <>
                    <div className="text-center py-4 mb-4">
                      <div className="w-14 h-14 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Heart size={24} className="text-[#C1121F]" strokeWidth={2} />
                      </div>
                      <p className="text-sm text-[#6B6B6B]">Waiting for a nearby voluntary donor.</p>
                    </div>
                    <button
                      onClick={() => protect(() => {
                        const userBloodGroup = currentDonor?.bloodGroup || 'O+';
                        const requiredBloodGroup = requestData.bloodGroup;
                        if (checkCompatibility(userBloodGroup, requiredBloodGroup)) {
                          setShowModal(true);
                        } else {
                          setShowMismatchModal(true);
                        }
                      })}
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

                {requestData.status === 'en-route' && (
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#D99000] tracking-widest uppercase mb-1">Donor Confirmed</p>
                    <div className="text-sm font-semibold text-[#171717] mb-4">
                      {requestData.donorName || 'Ahmed K.'} · ETA {requestData.donorEta || '30 min'}
                    </div>
                    <div className="flex justify-center mb-4">
                      <CountdownRing seconds={countdown} total={totalSeconds} />
                    </div>
                    <p className="text-xs text-[#6B6B6B] mb-4">
                      Commitment window active. Donor has committed to reaching the hospital within the selected ETA.
                    </p>
                    
                    {/* Actions panel: visible to assigned donor, or open for demo mode if no donor is logged in */}
                    {(!user || user.uid === requestData.acceptedByDonorId) ? (
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

                {requestData.status === 'fulfilled' && (
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
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = `Urgent blood request for ${requestData.patientName} (${requestData.bloodGroup}) at ${requestData.hospital}, ${requestData.city}. Help save a life: ${url}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    showToast("Request link copied to clipboard!");
                  }}
                  className="btn-ghost text-xs py-1.5 px-3 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Group Mismatch Warnings Modal (Verified Member Aesthetic) */}
      {showMismatchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMismatchModal(false)} />
          <div className="relative bg-[#121212] border border-[#2A1013] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
            <div className="w-10 h-1 bg-neutral-800 rounded-full mx-auto mb-6 sm:hidden flex-shrink-0" />
            
            <div className="overflow-y-auto no-scrollbar">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C1C1E] border border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-[#FF453A] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse" />
                Verified Member Warning
              </div>

              <h2 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Blood Group Mismatch
              </h2>
              
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Your registered blood group is <strong className="text-[#FF453A] font-bold">{currentDonor?.bloodGroup || 'O+'}</strong>, but this request requires <strong className="text-[#FF453A] font-bold">{requestData.bloodGroup}</strong>. Direct donation is medically incompatible.
              </p>

              <div className="space-y-2.5 mt-auto">
                <button
                  onClick={() => {
                    setShowMismatchModal(false);
                    setShowModal(true);
                  }}
                  className="w-full bg-[#FF453A] hover:bg-[#FF3B30] text-white text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  I'm Sending Someone Else
                </button>

                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    showToast("Request link copied to clipboard!");
                  }}
                  className="w-full bg-[#1C1C1E] border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Copy Request Link
                </button>

                <button
                  onClick={() => setShowMismatchModal(false)}
                  className="w-full bg-transparent text-neutral-500 hover:text-neutral-400 text-sm font-bold py-2 px-4 rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donor Acceptance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="w-10 h-1 bg-[#E8E8E8] rounded-full mx-auto mb-6 sm:hidden flex-shrink-0" />
            <div className="overflow-y-auto no-scrollbar">
              <h2 className="text-xl font-extrabold text-[#171717] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                You're about to help.
              </h2>
              <p className="text-sm text-[#6B6B6B] mb-5">
                Estimated time to reach <strong>{requestData.hospital}</strong>?
              </p>
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {ETA_OPTIONS.map((eta) => (
                  <button
                    key={eta}
                    onClick={() => setSelectedEta(eta)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
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
              <div className="mt-auto">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedEta || confirming}
                  className="btn-primary w-full justify-center py-3.5 text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
                <button onClick={() => setShowModal(false)} className="btn-ghost w-full justify-center mt-2 text-sm text-[#6B6B6B] min-h-[44px]">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-neutral-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 animate-slide-up">
          <CheckCircle size={14} className="text-green-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
