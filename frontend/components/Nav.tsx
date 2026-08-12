import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Droplets, Menu, X, Activity } from 'lucide-react'
import MagneticButton from './MagneticButton'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) =>
    loc.pathname === path ? 'text-[#C1121F]' : 'text-[#6B6B6B] hover:text-[#171717]'

  return (
    <nav className={`glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-0 border-b border-[#F0D9DC] shadow-sm' : 'py-1'}`}>
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

        {/* Desktop */}
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

        <div className="hidden md:flex items-center gap-3">
          <MagneticButton>
            <Link to="/donor/register" className="btn-secondary py-2 px-4 text-sm">
              Become a Donor
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link to="/request/new" className="btn-primary py-2 px-4 text-sm">
              <Activity size={14} strokeWidth={2} />
              Request Blood
            </Link>
          </MagneticButton>
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
          <div className="flex gap-3 pt-2">
            <Link to="/donor/register" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center py-2.5 text-sm">
              Become a Donor
            </Link>
            <Link to="/request/new" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center py-2.5 text-sm">
              Request Blood
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
