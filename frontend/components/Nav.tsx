import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Droplets, Menu, X, Activity } from 'lucide-react'
import MagneticButton from './MagneticButton'
import { useAuth } from '@/src/context/AuthContext'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) =>
    loc.pathname === path ? 'text-[#C1121F]' : 'text-[#6B6B6B] hover:text-[#171717]'

  const handleLogoutClick = async () => {
    try {
      await logout()
      setOpen(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <nav className={`glass-nav fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-0 border-b border-[#F0D9DC] shadow-sm' : 'py-1'}`}>
      <div className={`max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-[#C1121F]" />
            <Droplets size={16} className="relative text-white" strokeWidth={2} />
          </div>
          <span
            className="text-[#171717] font-bold text-[1.0625rem] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Erythro<span className="text-[#C1121F]">Net</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/live-board" className={`text-sm font-medium transition-colors ${isActive('/live-board')}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Live Board
          </Link>
          <Link to="/how-it-works" className={`text-sm font-medium transition-colors ${isActive('/how-it-works')}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            How It Works
          </Link>
          <Link to="/impact" className={`text-sm font-medium transition-colors ${isActive('/impact')}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Impact
          </Link>
        </div>

        {/* Desktop Action Buttons & Auth */}
        <div className="hidden md:flex items-center gap-3">
          <MagneticButton>
            <Link to="/donor/register" className="btn-secondary py-2 px-4 text-sm rounded-xl">
              Become a Donor
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link to="/request/new" className="btn-primary py-2 px-4 text-sm rounded-xl">
              <Activity size={14} strokeWidth={2} />
              Request Blood
            </Link>
          </MagneticButton>

          <div className="h-5 w-px bg-[#E8E8E8] mx-1" />

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 py-1.5 px-3 bg-[#FFF7F7] border border-[#F0D9DC] hover:border-[#C1121F] rounded-xl transition-all cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-[#C1121F] text-white flex items-center justify-center font-bold text-xs">
                  {(user.displayName || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[#171717]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
              
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E8E8E8] rounded-xl shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <Link to="/dashboard" className="block px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#FFF7F7] hover:text-[#C1121F] transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#6B6B6B] hover:bg-red-50 hover:text-[#C1121F] transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs font-bold text-[#6B6B6B] hover:text-[#C1121F] py-2 px-2.5 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-[#FFF7F7] border border-[#F0D9DC] text-[#C1121F] hover:bg-[#C1121F] hover:text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg text-[#6B6B6B]" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#F0D9DC] px-4 py-4 flex flex-col gap-3">
          <Link to="/live-board" onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#171717] py-2.5 border-b border-[#E8E8E8]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Live Board
          </Link>
          <Link to="/how-it-works" onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#171717] py-2.5 border-b border-[#E8E8E8]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            How It Works
          </Link>
          <Link to="/impact" onClick={() => setOpen(false)}
            className="text-sm font-medium text-[#171717] py-2.5 border-b border-[#E8E8E8]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Impact
          </Link>
          
          {user && (
            <div className="py-2 border-b border-[#E8E8E8] flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center font-bold text-xs">
                {(user.displayName || user.email?.split('@')[0] || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm font-bold text-[#171717]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link to="/donor/register" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 text-sm">
              Become a Donor
            </Link>
            <Link to="/request/new" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center py-2.5 text-sm">
              Request Blood
            </Link>
          </div>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-secondary justify-center py-2.5 text-sm">
                Dashboard
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="text-sm font-medium text-[#C1121F] py-2.5 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2 border-t border-[#E8E8E8] mt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 justify-center py-2.5 text-sm text-center">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 text-sm text-center">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
