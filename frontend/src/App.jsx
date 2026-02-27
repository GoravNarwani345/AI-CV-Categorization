import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useParams, useNavigate } from 'react-router-dom'
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

import VerifyEmail from './pages/VerifyEmail'

const App = () => {
  return (
    <BrowserRouter>
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
        <Route path='/candidateDashboard' element={<ProtectedRoute element={<CandidateDashboard />} allowedRoles={['candidate']} />} />
        <Route path='/recruiterDashboard' element={<ProtectedRoute element={<RecruiterDashboard />} allowedRoles={['recruiter']} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
