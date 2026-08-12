import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CheckCircle, Clock, Droplets, Heart, MapPin } from 'lucide-react'
import { backend } from '../lib/firebase'
import { BloodRequest } from '../types'
import { formatTimeAgo } from '../components/RequestCard'

export default function DonorDashboard() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [available, setAvailable] = useState(true)
  const [countdown, setCountdown] = useState(5400)

  useEffect(() => {
    return backend.subscribeToRequests((data) => {
      setRequests(data)
    })
  }, [])

  const currentDonor = backend.getCurrentDonor() || {
    uid: 'donor-123',
    name: 'Ahmed Khan',
    phone: '03009999999',
    city: 'Lahore',
    district: 'Lahore Cantonment',
    bloodGroup: 'O+',
    notifications: ['WhatsApp', 'SMS'],
    lastDonation: '2026-07-12',
    totalDonations: 3,
    registeredAt: Date.now() - 30 * 24 * 60 * 60 * 1000
  }

  // Active commitment: status is en-route and accepted by this donor
  const activeCommitment = requests.find(
    (r) => r.acceptedByDonorId === currentDonor.uid && r.status === 'en-route'
  )

  // Donation history: status is fulfilled and accepted by this donor
  const historyList = requests.filter(
    (r) => r.acceptedByDonorId === currentDonor.uid && r.status === 'fulfilled'
  )

  // Fallback history items if database history is empty (for demo data completeness)
  const displayHistory = historyList.length > 0 
    ? historyList.map(r => ({
        id: r.id,
        bloodGroup: r.bloodGroup,
        hospital: r.hospital,
        district: r.district,
        date: new Date(r.acceptedAt || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'fulfilled'
      }))
    : [
        { id: 'hist-1', bloodGroup: currentDonor.bloodGroup, hospital: 'Jinnah Hospital', district: 'Lahore Cantonment', date: 'Jul 12, 2026', status: 'fulfilled' },
        { id: 'hist-2', bloodGroup: currentDonor.bloodGroup, hospital: 'Services Hospital', district: 'Gulberg, Lahore', date: 'May 4, 2026', status: 'fulfilled' },
        { id: 'hist-3', bloodGroup: currentDonor.bloodGroup, hospital: 'Mayo Hospital', district: 'Old Anarkali', date: 'Jan 28, 2026', status: 'fulfilled' },
      ];

  const totalDonationsCount = currentDonor.totalDonations + (historyList.length > 0 ? historyList.length : 0);

  useEffect(() => {
    if (!activeCommitment) return

    const expiresAt = activeCommitment.lockExpiresAt || ((activeCommitment.acceptedAt || Date.now()) + 90 * 60 * 1000)
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setCountdown(remaining)
    }

    updateTimer()
    const t = setInterval(updateTimer, 1000)
    return () => clearInterval(t)
  }, [activeCommitment?.id])

  const m = Math.floor(countdown / 60)
  const s = countdown % 60

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 mb-5"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#969696] uppercase tracking-wider mb-1">Donor Dashboard</p>
              <h1 className="text-2xl font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Good morning, {currentDonor.name.split(' ')[0]}.
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAvailable(!available)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  available
                    ? 'bg-green-50 border-green-200 text-[#168A55]'
                    : 'bg-[#FFF7F7] border-[#F0D9DC] text-[#969696]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className={`w-2 h-2 rounded-full ${available ? 'bg-[#168A55] animate-live-dot' : 'bg-[#969696]'}`} />
                {available ? 'Available to Help' : 'Unavailable'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#E8E8E8]">
            {[
              { icon: Droplets, label: 'Donations Fulfilled', value: String(totalDonationsCount), crimson: true },
              { icon: Heart, label: 'Active Group', value: currentDonor.bloodGroup, crimson: false },
              { icon: Clock, label: 'Next Eligible', value: currentDonor.lastDonation 
                ? new Date(new Date(currentDonor.lastDonation).getTime() + 56 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Eligible Now', crimson: false },
            ].map(({ icon: Icon, label, value, crimson }) => (
              <div key={label} className="text-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${crimson ? 'bg-[#FDE8EA]' : 'bg-[#F5F5F5]'}`}>
                  <Icon size={15} className={crimson ? 'text-[#C1121F]' : 'text-[#6B6B6B]'} strokeWidth={2} />
                </div>
                <div className="text-lg font-extrabold text-[#171717]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
                <div className="text-[11px] text-[#969696]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-5">
          {/* Active commitment */}
          <div>
            {activeCommitment ? (
              <div className="bg-white rounded-2xl border border-amber-200 p-5 mb-5 animate-pulse-border"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)', borderColor: '#fde68a' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#D99000]" />
                  <span className="text-xs font-bold tracking-widest text-[#D99000] uppercase">Active Commitment</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#171717] mb-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeCommitment.hospital}</h2>
                    <div className="flex items-center gap-1 text-[#6B6B6B] text-sm mb-1">
                      <MapPin size={13} strokeWidth={2} />
                      {activeCommitment.district} · {activeCommitment.ward}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-extrabold text-[#C1121F]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{activeCommitment.bloodGroup}</span>
                      <span className="text-xs text-[#6B6B6B] font-medium">{activeCommitment.units} units required</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#D99000]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-[#969696] font-semibold uppercase tracking-wider">Commitment window</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-[#D99000]">ETA: {activeCommitment.donorEta} · Status: Donor En Route</span>
                  <Link to={`/request/${activeCommitment.id}`} className="text-xs font-bold text-[#C1121F] hover:underline">View Request →</Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 mb-5 text-center"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-[#969696]" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-[#171717] mb-1">No Active Commitments</h3>
                <p className="text-xs text-[#6B6B6B] max-w-[280px] mx-auto mb-3">You don't have any en-route donations right now. Check the live board to save lives.</p>
                <Link to="/live-board" className="btn-primary text-xs py-1.5 px-4 rounded-lg inline-flex items-center gap-1.5">
                  Go to Live Board
                </Link>
              </div>
            )}

            {/* History */}
            <h2 className="text-sm font-bold text-[#171717] mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Donation History</h2>
            <div className="space-y-3">
              {displayHistory.map((h, i) => (
                <div key={h.id} className="bg-white rounded-xl border border-[#E8E8E8] p-4 flex items-center gap-4"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-[#FDE8EA] rounded-xl flex items-center justify-center">
                      <span className="text-sm font-extrabold text-[#C1121F]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{h.bloodGroup}</span>
                    </div>
                    {i < displayHistory.length - 1 && (
                      <div className="absolute left-1/2 -bottom-4 w-px h-4 bg-[#E8E8E8]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#171717]">{h.hospital}</div>
                    <div className="flex items-center gap-1 text-[#6B6B6B] text-xs mt-0.5">
                      <MapPin size={10} strokeWidth={2} />
                      {h.district}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#969696]">{h.date}</div>
                    <div className="flex items-center gap-1 text-[#168A55] text-xs font-medium mt-0.5 justify-end">
                      <CheckCircle size={10} strokeWidth={2} />
                      Fulfilled
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side: nearby requests */}
          <div>
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#C1121F] animate-live-dot" />
                <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Nearby Requests</span>
              </div>
              <div className="space-y-3">
                {requests
                  .filter((r) => r.status === 'awaiting')
                  .slice(0, 4)
                  .map((r) => (
                  <Link to={`/request/${r.id}`} key={r.id}
                    className="block p-3.5 rounded-xl border border-[#E8E8E8] hover:border-[#F0D9DC] hover:bg-[#FFF7F7] transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#C1121F] tracking-widest">{r.urgency.toUpperCase()}</span>
                        <div className="text-sm font-semibold text-[#171717] mt-0.5">{r.hospital}</div>
                        <div className="text-xs text-[#6B6B6B]">{r.district}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-[#C1121F]"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.bloodGroup}</div>
                        <div className="text-[10px] text-[#969696]">{formatTimeAgo(r.createdAt)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {requests.filter((r) => r.status === 'awaiting').length === 0 && (
                  <p className="text-xs text-[#969696] text-center py-4">No active requests near you right now.</p>
                )}
              </div>
              <Link to="/live-board" className="btn-secondary w-full justify-center py-2.5 text-xs mt-4">
                <Activity size={13} strokeWidth={2} />
                View Full Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
