import { MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { backend } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { BloodRequest } from '../types';
import InteractiveCard from './InteractiveCard';
import { useAuth } from '@/src/context/AuthContext';
import { useProtectedAction } from '@/src/hooks/useProtectedAction';


export type RequestStatus = 'awaiting' | 'en-route' | 'fulfilled'
export type Urgency = 'critical' | 'urgent' | 'routine'

export interface RequestData {
  id: string
  bloodGroup: string
  units: number
  hospital: string
  district: string
  ward: string
  urgency: Urgency
  status: RequestStatus
  timeAgo?: string
  createdAt?: number
  donorName?: string
  donorEta?: string
}

const urgencyLabel: Record<Urgency, string> = {
  critical: 'CRITICAL',
  urgent: 'URGENT',
  routine: 'ROUTINE',
}

const urgencyColor: Record<Urgency, string> = {
  critical: 'text-[#C1121F]',
  urgent: 'text-[#D99000]',
  routine: 'text-[#6B6B6B]',
}

const statusConfig: Record<RequestStatus, { label: string; dot: string; bg: string; text: string }> = {
  awaiting: { label: 'AWAITING DONOR', dot: 'bg-[#C1121F]', bg: 'bg-[#FDE8EA]', text: 'text-[#C1121F]' },
  'en-route': { label: 'DONOR EN ROUTE', dot: 'bg-[#D99000]', bg: 'bg-amber-50', text: 'text-[#D99000]' },
  fulfilled: { label: 'FULFILLED', dot: 'bg-[#168A55]', bg: 'bg-green-50', text: 'text-[#168A55]' },
}

export function formatTimeAgo(timestamp: number | undefined, defaultVal = 'Just now') {
  if (!timestamp) return defaultVal;
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

interface Props {
  data: BloodRequest | RequestData
  compact?: boolean
  dark?: boolean
}

export default function RequestCard({ data, compact, dark }: Props) {
  const { user } = useAuth();
  const protect = useProtectedAction();
  const st = statusConfig[data.status]
  const isCritical = data.urgency === 'critical' && data.status === 'awaiting'
  const time = ('timeAgo' in data && data.timeAgo) ? data.timeAgo : formatTimeAgo(data.createdAt)

  const cardBg = dark
    ? `bg-gradient-to-b from-[#3D0308] via-[#280205] to-[#140002] border border-[#6B0D15]/40 hover:border-[#9E1622] hover:shadow-[0_0_20px_rgba(158,22,34,0.35)] transition-all duration-300 rounded-[14px] overflow-hidden`
    : `bg-white rounded-[14px] border overflow-hidden ${
        isCritical ? 'border-[#F0D9DC] animate-glow' : 'border-[#E8E8E8]'
      }`

  const urgencyTextColor = dark
    ? data.urgency === 'critical'
      ? 'text-red-400 font-bold'
      : data.urgency === 'urgent'
      ? 'text-amber-400 font-bold'
      : 'text-[#D4A5A9]'
    : urgencyColor[data.urgency]

  const statusBadgeStyle = dark
    ? data.status === 'awaiting'
      ? 'bg-[#54080F] text-[#F87171] border border-[#780F18]'
      : data.status === 'en-route'
      ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
    : `${st.bg} ${st.text}`

  return (
    <InteractiveCard
      className={cardBg}
      style={{ boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.06)' }}
    >
      <div className="flex">
        {/* Urgency rail */}
        <div
          className={`w-1 flex-shrink-0 ${
            data.urgency === 'critical'
              ? 'bg-[#C1121F] shadow-[0_0_8px_#C1121F]'
              : data.urgency === 'urgent'
              ? 'bg-[#D99000]'
              : dark
              ? 'bg-neutral-700'
              : 'bg-[#E8E8E8]'
          }`}
        />

        <div className="flex-1 p-4">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={`text-[10px] font-bold tracking-widest ${urgencyTextColor}`}>
                {urgencyLabel[data.urgency]}
              </span>
              <div className={`flex items-center gap-1.5 mt-0.5 ${dark ? 'text-[#D4A5A9]' : 'text-[#969696]'}`}>
                <Clock size={11} strokeWidth={2} />
                <span className="text-[11px]">{time}</span>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-extrabold leading-none transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${
                  dark ? 'text-white' : 'text-[#C1121F]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {data.bloodGroup}
              </div>
              <div className={`text-[11px] font-medium mt-1 ${dark ? 'text-[#D4A5A9]' : 'text-[#6B6B6B]'}`}>
                {data.units} UNIT{data.units > 1 ? 'S' : ''}
              </div>
            </div>
          </div>

          {/* Hospital */}
          <div className="mb-3">
            <div className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[#171717]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {data.hospital}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} strokeWidth={2} className={dark ? 'text-[#D4A5A9]' : 'text-[#969696]'} />
              <span className={`text-[12px] ${dark ? 'text-[#D4A5A9]' : 'text-[#6B6B6B]'}`}>{data.district} · {data.ward}</span>
            </div>
          </div>

          {/* Status */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadgeStyle} mb-3 animate-breath`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${data.status === 'awaiting' ? 'animate-live-dot' : ''}`} />
            {st.label}
          </div>

          {/* Verification + CTA */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 transition-transform duration-300 group-hover:-translate-y-0.5 ${dark ? 'text-emerald-400' : 'text-[#168A55]'}`}>
              <ShieldCheck size={12} strokeWidth={2} />
              <span className="text-[11px] font-medium">Verified Request</span>
            </div>
            {data.status === 'awaiting' && (
              <button
                className="bg-[#C1121F] text-white hover:bg-[#9E1622] shadow-[0_0_12px_rgba(193,18,31,0.4)] py-1.5 px-3 text-xs font-semibold rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 inline-flex items-center gap-1.5 cursor-pointer"
                onClick={async (e) => {
                  e.stopPropagation();
                  protect(async () => {
                    if (!user) return;
                    const donor = backend.getCurrentDonor() || {
                      uid: user.uid,
                      name: user.displayName || user.email?.split('@')[0] || 'Authenticated Donor',
                      phone: '03001234567',
                      city: 'Lahore',
                      district: 'Lahore Cantonment',
                      bloodGroup: 'O+',
                      notifications: [],
                      totalDonations: 0,
                      registeredAt: Date.now()
                    };
                    if (!backend.getCurrentDonor()) {
                      await backend.registerDonor(donor);
                    }
                    const eta = '30 min';
                    await backend.acceptRequest(data.id, donor.name, eta, donor.uid);
                    data.status = 'en-route';
                    data.donorName = donor.name;
                    data.donorEta = eta;
                  }, `/request/${data.id}`);
                }}
              >
                <Heart size={12} strokeWidth={2} />
                I Will Donate
              </button>
            )}
            {data.status === 'en-route' && (
              <span className={`text-xs font-medium transition-transform duration-300 group-hover:-translate-y-0.5 ${dark ? 'text-amber-300' : 'text-[#D99000]'}`}>
                {data.donorName} · ETA {data.donorEta}
              </span>
            )}
          </div>
        </div>
      </div>
    </InteractiveCard>
  )
}
