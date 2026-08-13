import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Upload, X, Activity } from 'lucide-react'
import BloodGroupSelector from '../components/BloodGroupSelector'
import { backend } from '@/lib/firebase'
import { auth } from '@/src/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const STEPS = ['01 PATIENT', '02 VERIFY', '03 DOCUMENT', '04 REVIEW']

const HOSPITALS = [
  'Jinnah Hospital', 'Services Hospital', 'Mayo Hospital', 'Aga Khan Hospital',
  'PIMS Hospital', 'Liaquat National Hospital', 'Shaukat Khanum', 'Civil Hospital',
]

const HOSPITAL_LOCATIONS: Record<string, { city: string; district: string }> = {
  'Jinnah Hospital': { city: 'Lahore', district: 'Lahore Cantonment' },
  'Services Hospital': { city: 'Lahore', district: 'Gulberg, Lahore' },
  'Mayo Hospital': { city: 'Lahore', district: 'Old Anarkali, Lahore' },
  'Aga Khan Hospital': { city: 'Karachi', district: 'Karachi South' },
  'Liaquat National Hospital': { city: 'Karachi', district: 'Karachi East' },
  'Civil Hospital': { city: 'Karachi', district: 'Saddar, Karachi' },
  'PIMS Hospital': { city: 'Islamabad', district: 'G-8, Islamabad' },
  'Shaukat Khanum': { city: 'Lahore', district: 'DHA, Lahore' },
}

const URGENCIES = ['Critical', 'Urgent', 'Routine']

function FieldLabel({ text }: { text: string }) {
  return (
    <label className="block text-xs font-semibold text-[#171717] mb-1.5 tracking-wide uppercase"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {text}
    </label>
  )
}

export default function RequestNew() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    patientName: '',
    hospital: '',
    ward: '',
    bloodGroup: '',
    units: '1',
    context: '',
    urgency: 'Critical',
    phone: '',
    otp: ['', '', '', '', '', ''],
    otpVerified: false,
    docAttached: false,
    agreed: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const setField = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleOtpChange = (i: number, v: string) => {
    if (v.length > 1) return
    const next = [...form.otp]
    next[i] = v
    setField('otp', next)
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  const initRecaptcha = () => {
    if (!auth) {
      console.warn("⚠️ Firebase Auth is not initialized. Recaptcha cannot be set up.");
      return;
    }
    try {
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {}
      });
      (window as any).recaptchaVerifier = verifier;
      setRecaptchaVerifier(verifier);
    } catch (error) {
      console.error("RecaptchaVerifier initialization failed:", error);
    }
  };

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        initRecaptcha();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const formatPhoneNumber = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return '+92' + clean.slice(1);
    }
    if (clean.startsWith('92')) {
      return '+' + clean;
    }
    return '+' + clean;
  };

  const sendOtpCode = async () => {
    if (!auth) {
      alert("Firebase Auth is not initialized. Please verify your environment configuration.");
      return;
    }
    if (!form.phone) return;
    
    setSendingOtp(true);
    setOtpError(false);
    
    try {
      const formatted = formatPhoneNumber(form.phone);
      let verifier = recaptchaVerifier;
      if (!verifier) {
        initRecaptcha();
        verifier = (window as any).recaptchaVerifier;
      }
      if (!verifier) throw new Error("reCAPTCHA verifier is not initialized.");
      
      const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      alert(`Failed to send SMS OTP: ${err.message || err}`);
      if (err.code === 'auth/invalid-app-credential' || err.code === 'auth/captcha-check-failed') {
        initRecaptcha();
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpCode = async () => {
    if (!confirmationResult) {
      alert("No active verification session. Please request a new code.");
      return;
    }
    const code = form.otp.join('');
    if (code.length !== 6) {
      alert("Please enter the complete 6-digit code.");
      return;
    }
    
    setVerifyingOtp(true);
    setOtpError(false);
    
    try {
      await confirmationResult.confirm(code);
      setField('otpVerified', true);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setOtpError(true);
      alert(`Invalid OTP code: ${err.message || err}`);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const location = HOSPITAL_LOCATIONS[form.hospital] || { city: 'Lahore', district: 'General' };
      const urgencyMap: Record<string, 'critical' | 'urgent' | 'routine'> = {
        Critical: 'critical',
        Urgent: 'urgent',
        Routine: 'routine',
      };

      const requestPayload = {
        patientName: form.patientName,
        hospital: form.hospital,
        ward: form.ward,
        city: location.city,
        district: location.district,
        bloodGroup: form.bloodGroup,
        units: parseInt(form.units, 10) || 1,
        medicalContext: form.context || 'Emergency',
        urgency: urgencyMap[form.urgency] || 'critical',
        phone: form.phone,
        slipUrl: '',
      }

      await backend.createRequest(requestPayload, selectedFile)
      setPublished(true)
      // Navigate to live board after a brief moment to show success animation
      setTimeout(() => navigate('/live-board'), 1500)
    } catch (err) {
      console.error("Publish request error:", err)
      alert("Failed to publish request. Please check your connection and try again.")
    } finally {
      setPublishing(false)
    }
  }

  const urgencyColor: Record<string, string> = {
    Critical: 'border-[#C1121F] bg-[#FDE8EA] text-[#C1121F]',
    Urgent: 'border-[#D99000] bg-amber-50 text-[#D99000]',
    Routine: 'border-[#168A55] bg-green-50 text-[#168A55]',
  }

  if (published) {
    return (
      <div className="pt-16 min-h-screen bg-[#FFF7F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-10 max-w-md w-full text-center"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div className="w-16 h-16 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#F0D9DC]">
            <Activity size={28} className="text-[#C1121F]" strokeWidth={2} />
          </div>
          <div className="w-8 h-0.5 bg-[#C1121F] rounded-full mx-auto mb-5" />
          <h2 className="text-2xl font-extrabold text-[#171717] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Request Live
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-6">Nearby voluntary donors have been notified.</p>
          <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-[#6B6B6B]">
            {['Live Board', 'WhatsApp', 'SMS', 'Push'].map((ch) => (
              <div key={ch} className="flex items-center gap-2 bg-[#FFF7F7] rounded-lg px-3 py-2.5 border border-[#F0D9DC]">
                <CheckCircle size={12} className="text-[#168A55]" strokeWidth={2} />
                {ch}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/live-board')} className="btn-primary w-full justify-center py-3">
            View Live Board
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7]">
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[#6B6B6B] text-sm hover:text-[#171717] transition-colors mb-6">
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest transition-all ${
                  i === step ? 'bg-[#C1121F] text-white' : i < step ? 'text-[#168A55]' : 'text-[#969696]'
                }`}>
                  {i < step && <CheckCircle size={10} strokeWidth={2.5} />}
                  {s}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 w-3 sm:w-6 ${i < step ? 'bg-[#C1121F]' : 'bg-[#E8E8E8]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Step 0: Patient info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Patient Information</h2>

              <div>
                <FieldLabel text="Patient Name" />
                <input className="input-field" placeholder="Full name" value={form.patientName}
                  onChange={(e) => setField('patientName', e.target.value)} />
              </div>

              <div>
                <FieldLabel text="Hospital" />
                <select className="input-field" value={form.hospital}
                  onChange={(e) => setField('hospital', e.target.value)}>
                  <option value="">Select hospital</option>
                  {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <FieldLabel text="Ward / Floor / Bed" />
                <input className="input-field" placeholder="e.g. Ward 3, ICU Floor 2" value={form.ward}
                  onChange={(e) => setField('ward', e.target.value)} />
              </div>

              <div>
                <FieldLabel text="Blood Group" />
                <BloodGroupSelector value={form.bloodGroup} onChange={(v) => setField('bloodGroup', v)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel text="Units Required" />
                  <input type="number" min="1" max="10" className="input-field" value={form.units}
                    onChange={(e) => setField('units', e.target.value)} />
                </div>
                <div>
                  <FieldLabel text="Medical Context" />
                  <input className="input-field" placeholder="e.g. Trauma, Surgery" value={form.context}
                    onChange={(e) => setField('context', e.target.value)} />
                </div>
              </div>

              <div>
                <FieldLabel text="Urgency Level" />
                <div className="grid grid-cols-3 gap-2.5">
                  {URGENCIES.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setField('urgency', u)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.urgency === u ? urgencyColor[u] : 'border-[#E8E8E8] text-[#6B6B6B] bg-white'
                      }`}
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Verify */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Phone Verification</h2>
              <p className="text-sm text-[#6B6B6B]">Verification protects genuine emergency requests.</p>

              <div>
                <FieldLabel text="Mobile Number" />
                <input className="input-field" placeholder="03XX XXXXXXX" value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)} />
              </div>

              {/* Invisible Recaptcha Container */}
              <div id="recaptcha-container"></div>

              {!otpSent ? (
                <button
                  onClick={sendOtpCode}
                  disabled={!form.phone || sendingOtp}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {sendingOtp ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              ) : (
                <div>
                  <FieldLabel text="Enter 6-Digit Code" />
                  <div className="flex gap-2.5 justify-center my-3">
                    {form.otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all ${
                          otpError ? 'border-[#C1121F] bg-[#FFF7F7]' : d ? 'border-[#C1121F]' : 'border-[#E8E8E8]'
                        } focus:border-[#C1121F] focus:shadow-[0_0_0_3px_rgba(193,18,31,0.1)]`}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <div className="bg-[#FDE8EA] border border-[#F0D9DC] rounded-xl p-3 mb-3 text-xs text-[#C1121F] font-medium text-center">
                      Incorrect code. Please try again.
                    </div>
                  )}
                  {form.otpVerified ? (
                    <div className="flex items-center justify-center gap-2 text-[#168A55] font-medium text-sm">
                      <CheckCircle size={16} strokeWidth={2} />
                      Phone verified
                    </div>
                  ) : (
                    <button
                      onClick={verifyOtpCode}
                      disabled={verifyingOtp || form.otp.join('').length !== 6}
                      className="btn-primary w-full justify-center py-3 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {verifyingOtp ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Document */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload Hospital Document</h2>
              <p className="text-sm text-[#6B6B6B]">Prescription, blood order form or admission receipt</p>

              {!form.docAttached ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-[#F0D9DC] rounded-2xl p-10 text-center hover:bg-[#FFF7F7] transition-colors">
                    <div className="w-12 h-12 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Upload size={20} className="text-[#C1121F]" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-semibold text-[#171717] mb-1">Upload hospital slip</p>
                    <p className="text-xs text-[#969696]">JPG, PNG or PDF · Max 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setField('docAttached', true);
                      }
                    }} />
                </label>
              ) : (
                <div className="border border-[#168A55] bg-green-50 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle size={18} className="text-[#168A55]" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#168A55]">Document attached</p>
                      <p className="text-xs text-[#6B6B6B]">{selectedFile?.name || 'hospital_slip.pdf'}</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    setSelectedFile(null);
                    setField('docAttached', false);
                  }} className="text-[#969696] hover:text-[#C1121F] transition-colors">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-extrabold text-[#171717]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review & Publish</h2>

              <div className="bg-[#FFF7F7] border border-[#F0D9DC] rounded-xl p-4 space-y-3">
                {[
                  { label: 'Patient', value: form.patientName || '—' },
                  { label: 'Blood Group', value: form.bloodGroup || '—', bold: true, crimson: true },
                  { label: 'Units', value: form.units },
                  { label: 'Hospital', value: form.hospital || '—' },
                  { label: 'Ward', value: form.ward || '—' },
                  { label: 'Urgency', value: form.urgency },
                  { label: 'Phone', value: form.phone ? `${form.phone.slice(0, 4)}···· ${form.phone.slice(-3)}` : '—' },
                  { label: 'Phone Verified', value: form.otpVerified ? '✓ Yes' : '✗ No' },
                  { label: 'Document', value: form.docAttached ? '✓ Attached' : '✗ Missing' },
                ].map(({ label, value, bold, crimson }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-[#6B6B6B] text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <span className={`font-semibold ${crimson ? 'text-[#C1121F] text-base' : 'text-[#171717]'} ${bold ? 'font-extrabold' : ''}`}
                      style={bold ? { fontFamily: "'Plus Jakarta Sans', sans-serif" } : {}}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => setField('agreed', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#C1121F]"
                />
                <span className="text-sm text-[#171717]">
                  I confirm this is a <strong>genuine emergency medical request</strong>.
                </span>
              </label>

              <button
                onClick={handlePublish}
                disabled={!form.agreed || publishing}
                className="btn-primary w-full justify-center py-3.5 rounded-xl text-sm disabled:opacity-50"
              >
                {publishing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </span>
                ) : (
                  <>
                    <Activity size={16} strokeWidth={2} />
                    Publish Emergency Request
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1 justify-center py-3 text-sm">
                <ArrowLeft size={15} strokeWidth={2} />
                Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 0 && (!form.patientName || !form.hospital || !form.bloodGroup)) ||
                  (step === 1 && !form.otpVerified)
                }
                className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-50"
              >
                Continue
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
