import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/src/context/AuthContext'
import { auth } from '@/src/lib/firebase'
import { backend } from '@/lib/firebase'
import { Droplets, Mail, Lock, User, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react'
import MagneticButton from '../components/MagneticButton'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup, googleLogin } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/'

  // Synchronize form mode with route path (/signup vs /login)
  useEffect(() => {
    setIsSignUp(location.pathname === '/signup')
  }, [location.pathname])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name')
        if (!phone.trim()) throw new Error('Please enter your phone number')
        
        // 1. Firebase signup
        await signup(email, password, name)
        
        // 2. Automatically register default donor profile in SQLite/database
        const currentUser = auth?.currentUser
        if (currentUser) {
          await backend.registerDonor({
            uid: currentUser.uid,
            name: name,
            phone: phone,
            city: 'Lahore',
            district: 'Lahore Cantonment',
            bloodGroup: 'O+',
            notifications: [],
          })
        }
      } else {
        await login(email, password)
      }
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await googleLogin()
      
      // Auto-register google user as donor if not already exists
      const currentUser = auth?.currentUser
      if (currentUser) {
        const existingDonor = backend.getCurrentDonor()
        if (!existingDonor) {
          await backend.registerDonor({
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Google User',
            phone: '03000000000',
            city: 'Lahore',
            district: 'Lahore Cantonment',
            bloodGroup: 'O+',
            notifications: [],
          })
        }
      }
      
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    if (isSignUp) {
      navigate('/login')
    } else {
      navigate('/signup')
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#FFF7F7] flex items-center justify-center px-4 py-12">
      <div 
        className="bg-white rounded-3xl border border-[#E8E8E8] p-8 max-w-md w-full shadow-xl transition-all duration-300"
        style={{ boxShadow: '0 10px 40px rgba(193,18,31,0.06)' }}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#FDE8EA] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Droplets size={24} className="text-[#C1121F]" strokeWidth={2} />
          </div>
          <h1 
            className="text-2xl font-extrabold text-[#171717]" 
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {isSignUp ? 'Join ErythroNet' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1.5">
            {isSignUp 
              ? 'Create an account to start saving lives and requesting blood.' 
              : 'Sign in to access your dashboard and manage requests.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-[#C1121F] font-medium">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#171717] mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969696]" size={16} />
                  <input 
                    type="text" 
                    className="input-field input-icon-left" 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#171717] mb-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969696]" size={16} />
                  <input 
                    type="tel" 
                    className="input-field input-icon-left" 
                    placeholder="03XX XXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#171717] mb-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969696]" size={16} />
              <input 
                type="email" 
                className="input-field input-icon-left" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#171717] mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969696]" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field input-icon-left input-icon-right" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#969696] hover:text-[#C1121F] focus:outline-none cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3.5 text-sm font-bold rounded-xl shadow-lg shadow-red-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <hr className="border-[#E8E8E8]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold text-[#969696] uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="btn-secondary w-full justify-center py-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-[#E8E8E8] cursor-pointer hover:bg-neutral-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.71 14.93 1 12 1 7.37 1 3.4 3.63 1.45 7.45l3.86 3C6.27 7.64 8.87 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.45 12.27c0-.82-.07-1.61-.21-2.37H12v4.51h6.43c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.87c2.16-1.99 3.7-4.91 3.7-8.59z"
            />
            <path
              fill="#FBBC05"
              d="M5.31 14.55c-.24-.72-.37-1.49-.37-2.3s.13-1.58.37-2.3l-3.86-3C.53 8.67 0 10.27 0 12s.53 3.33 1.45 5.05l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.95 1.09-3.13 0-5.73-2.6-6.68-5.41L1.76 15.9C3.71 19.73 7.68 23 12 23z"
            />
          </svg>
          Google
        </button>

        <p className="mt-6 text-center text-xs text-[#6B6B6B]">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            onClick={toggleMode}
            className="text-[#C1121F] font-bold hover:underline cursor-pointer focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
