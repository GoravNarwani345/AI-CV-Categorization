import { BrowserRouter, Route, Routes, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import Home from './pages/Home'
import GetStarted from './pages/GetStarted'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import FeaturesPage from './pages/FeaturesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import VerificationPending from './pages/VerificationPending'
import ProtectedRoute from './components/ProtectedRoute'
import { toast } from 'react-toastify'
import { useAuth } from './contexts/AuthContext'

import VerifyEmail from './pages/VerifyEmail'

const App = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const isMemberPath = (path) => 
      path.startsWith('/candidateDashboard') || 
      path.startsWith('/recruiterDashboard') || 
      path.startsWith('/onboarding') || 
      path.startsWith('/verification-pending') ||
      path.startsWith('/reset-password') ||
      path.startsWith('/forgot-password') ||
      path.startsWith('/getstarted') ||
      path.startsWith('/verify-email');
    
    const isInMemberPath = isMemberPath(location.pathname);
    const hasToken = !!localStorage.getItem('token');

    if (hasToken && !isInMemberPath) {
      // Directly remove token as requested
      localStorage.removeItem('token');
      localStorage.removeItem('uid');
      
      // Also call logout to clear React state if user is present
      if (user) {
        logout();
        toast.info("Session ended.");
      }
    }

    prevPathRef.current = location.pathname;
  }, [location.pathname, logout, user]);

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/getstarted' element={<GetStarted />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password/:token' element={<ResetPassword />} />
      <Route path='/verify-email/:token' element={<VerifyEmail />} />
      <Route path='/onboarding' element={<Onboarding />} />
      <Route path='/verification-pending' element={<VerificationPending />} />
      <Route path='/features' element={<FeaturesPage />} />
      <Route path='/about' element={<AboutPage />} />
      <Route path='/contact' element={<ContactPage />} />
      <Route path='/candidateDashboard/*' element={<ProtectedRoute element={<CandidateDashboard />} allowedRoles={['candidate']} />} />
      <Route path='/recruiterDashboard/*' element={<ProtectedRoute element={<RecruiterDashboard />} allowedRoles={['recruiter']} />} />
    </Routes>
  )
}

export default App
