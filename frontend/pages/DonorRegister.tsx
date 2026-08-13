import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Droplets } from 'lucide-react'
import BloodGroupSelector from '../components/BloodGroupSelector'
import { backend } from '../lib/firebase'
import { useAuth } from '@/src/context/AuthContext'

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar']
const NOTIF = ['WhatsApp', 'SMS', 'Push Notification', 'Email']

export default function DonorRegister() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '', phone: '', city: '', district: '', bloodGroup: '',
    notifications: [] as string[], lastDonation: '',
  })

  useEffect(() => {
    if (user && user.displayName && !form.name) {
      setForm(f => ({ ...f, name: user.displayName || '' }))
    }
  }, [user])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const setField = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const toggleNotif = (n: string) =>
    setField('notifications', form.notifications.includes(n) ? form.notifications.filter((x) => x !== n) : [...form.notifications, n])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const uid = user ? user.uid : 'donor-' + Math.random().toString(36).substr(2, 9)
      await backend.registerDonor({
        uid,
        name: form.name,
        phone: form.phone,
        city: form.city,
        district: form.district || '',
        bloodGroup: form.bloodGroup,
        notifications: form.notifications,
        lastDonation: form.lastDonation || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      console.error("Donor registration error:", err)
      alert("Registration failed. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen bg-[#FFF7F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-10 max-w-md w-full text-center"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div className="w-16 h-16 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Droplets size={28} className="text-[#C1121F]" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Congratulations, {form.name.split(' ')[0]}!
          </h2>
          <div className="inline-flex items-center gap-2 bg-[#FDE8EA] text-[#C1121F] px-3 py-1.5 rounded-full text-sm font-bold mb-4">
            <span className="text-lg">{form.bloodGroup}</span>
            <span className="text-xs font-semibold">Donor</span>
          </div>
          <p className="text-sm text-[#171717] font-medium mb-2">
            You have registered as a voluntary donor.
          </p>
          <p className="text-sm text-[#6B6B6B] mb-6">
            You will receive notifications for emergency blood requests in your area. Your donation can save a life.
          </p>
          <button onClick={() => navigate('/live-board')} className="btn-primary w-full justify-center py-3">
            View Live Board
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full justify-center mt-2 text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#C1121F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Droplets size={22} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#171717]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Register as a Donor
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            Voluntary blood donors save lives. We'll only notify you for genuine emergencies in your area.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 space-y-5"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5 uppercase tracking-wide">Full Name</label>
                <input className="input-field" placeholder="Your full name" value={form.name}
                  onChange={(e) => setField('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5 uppercase tracking-wide">Phone</label>
                <input className="input-field" placeholder="03XX XXXXXXX" value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5 uppercase tracking-wide">City</label>
                <select className="input-field" value={form.city} onChange={(e) => setField('city', e.target.value)} required>
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171717] mb-1.5 uppercase tracking-wide">District</label>
                <input className="input-field" placeholder="Your district" value={form.district}
                  onChange={(e) => setField('district', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wide">Blood Group</label>
              <p className="text-xs text-[#6B6B6B] mb-3">Your blood type helps us find the right emergency faster.</p>
              <BloodGroupSelector value={form.bloodGroup} onChange={(v) => setField('bloodGroup', v)} />
            </div>



            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5 uppercase tracking-wide">Last Donation Date (optional)</label>
              <input type="date" className="input-field" value={form.lastDonation}
                onChange={(e) => setField('lastDonation', e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={!form.name || !form.phone || !form.city || !form.bloodGroup || submitting}
              className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                <>
                  <CheckCircle size={16} strokeWidth={2} />
                  Register as Donor
                </>
              )}
            </button>

            <p className="text-[11px] text-[#969696] text-center">
              You will only be notified for verified emergency requests in your area. You can opt out at any time.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
