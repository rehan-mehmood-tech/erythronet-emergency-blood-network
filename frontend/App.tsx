import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import LiveBoard from './pages/LiveBoard'
import RequestDetail from './pages/RequestDetail'
import RequestNew from './pages/RequestNew'
import DonorRegister from './pages/DonorRegister'
import DonorDashboard from './pages/DonorDashboard'
import ImpactDashboard from './pages/ImpactDashboard'
import HowItWorks from './pages/HowItWorks'
import Login from './pages/Login'
import SmoothScroll from './components/SmoothScroll'
import { AuthProvider } from '@/src/context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SmoothScroll>
          <Nav />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/live-board" element={<LiveBoard />} />
            <Route path="/request/new" element={<RequestNew />} />
            <Route path="/request/:id" element={<RequestDetail />} />
            <Route path="/donor/register" element={<DonorRegister />} />
            <Route path="/dashboard" element={<DonorDashboard />} />
            <Route path="/impact" element={<ImpactDashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
          </Routes>
        </SmoothScroll>
      </BrowserRouter>
    </AuthProvider>
  )
}
