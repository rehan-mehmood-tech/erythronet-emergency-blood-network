import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, SlidersHorizontal, X } from 'lucide-react'
import RequestCard from '../components/RequestCard'
import { backend, requestNotificationPermission } from '../lib/firebase'
import type { RequestData, Urgency, RequestStatus } from '../components/RequestCard'
import type { BloodRequest } from '../types'

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad']
const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const URGENCIES: { label: string; value: Urgency | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Routine', value: 'routine' },
]

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-150 ${
        active
          ? 'bg-[#C1121F] text-white'
          : 'bg-white text-[#6B6B6B] border border-[#E8E8E8] hover:bg-[#FDE8EA] hover:border-[#F0D9DC] hover:text-[#C1121F]'
      }`}
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxShadow: active ? 'none' : '2px 2px 6px rgba(193,18,31,0.05), -2px -2px 6px rgba(255,255,255,0.9)',
      }}
    >
      {label}
    </button>
  )
}

export default function LiveBoard() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [city, setCity] = useState('All Cities')
  const [blood, setBlood] = useState('All')
  const [urgency, setUrgency] = useState<Urgency | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')

  useEffect(() => {
    requestNotificationPermission();

    // Use backend.subscribeToRequests which handles FastAPI polling internally
    const unsubscribe = backend.subscribeToRequests((data) => {
      setRequests(data as BloodRequest[]);
    });

    return () => unsubscribe();
  }, []);


  const filtered = requests.filter((r) => {
    if (city !== 'All Cities' && !r.district.includes(city) && !r.hospital.toLowerCase().includes(city.toLowerCase())) {
      const cityMap: Record<string, string[]> = {
        Lahore: ['Lahore', 'Gulberg'],
        Karachi: ['Karachi'],
        Islamabad: ['Islamabad', 'G-8'],
      }
      if (!cityMap[city]?.some((k) => r.district.includes(k))) return false
    }
    if (blood !== 'All' && r.bloodGroup !== blood) return false
    if (urgency !== 'all' && r.urgency !== urgency) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  const hasFilters = city !== 'All Cities' || blood !== 'All' || urgency !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setCity('All Cities')
    setBlood('All')
    setUrgency('all')
    setStatusFilter('all')
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0D9DC]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#C1121F] opacity-50" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C1121F]" />
                </span>
                <span className="text-xs font-bold tracking-widest text-[#C1121F] uppercase">Live</span>
                <span className="text-xs text-[#969696]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Live Emergency Requests
              </h1>
              <p className="text-[#6B6B6B] text-sm mt-1">Verified requests currently seeking voluntary donors.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[#6B6B6B]">
              <Activity size={16} strokeWidth={2} className="text-[#C1121F]" />
              <span className="text-sm font-medium">Updates in real time</span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} strokeWidth={2} className="text-[#969696] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#969696] uppercase tracking-wider">City</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CITIES.map((c) => (
                <FilterChip key={c} label={c} active={city === c} onClick={() => setCity(c)} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#969696] uppercase tracking-wider ml-4">Blood Group</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {BLOOD_GROUPS.map((b) => (
                <FilterChip key={b} label={b} active={blood === b} onClick={() => setBlood(b)} />
              ))}
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              <span className="text-xs font-semibold text-[#969696] uppercase tracking-wider">Urgency:</span>
              {URGENCIES.map(({ label, value }) => (
                <FilterChip key={value} label={label} active={urgency === value} onClick={() => setUrgency(value)} />
              ))}
              <span className="text-xs font-semibold text-[#969696] uppercase tracking-wider ml-2">Status:</span>
              <FilterChip label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
              <FilterChip label="Awaiting" active={statusFilter === 'awaiting'} onClick={() => setStatusFilter('awaiting')} />
              <FilterChip label="En Route" active={statusFilter === 'en-route'} onClick={() => setStatusFilter('en-route')} />
              <FilterChip label="Fulfilled" active={statusFilter === 'fulfilled'} onClick={() => setStatusFilter('fulfilled')} />
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-[#969696] hover:text-[#C1121F] transition-colors ml-1">
                  <X size={12} strokeWidth={2} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity size={22} className="text-[#C1121F]" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-[#171717] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No active requests
            </h3>
            <p className="text-sm text-[#6B6B6B]">No requests match your current filters.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 btn-ghost text-sm">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to={`/request/${r.id}`}
                className="block cursor-pointer rounded-[14px] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(193,18,31,0.14)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1121F]/50"
              >
                <RequestCard data={r} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
