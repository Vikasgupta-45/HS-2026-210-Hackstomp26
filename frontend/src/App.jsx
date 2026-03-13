import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AshaLoginPage from './pages/AshaLoginPage'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorAuthPage from './pages/DoctorAuthPage'
import AshaDashboard from './pages/AshaDashboard'
import { PrescriptionsPage, ReportsPage, MessagesPage } from './pages/DoctorSubPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/asha-login" element={<AshaLoginPage />} />
      <Route path="/asha-dashboard" element={<AshaDashboard />} />
      <Route path="/doctor-login" element={<DoctorAuthPage />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/prescriptions" element={<PrescriptionsPage />} />
      <Route path="/doctor/reports" element={<ReportsPage />} />
      <Route path="/doctor/messages" element={<MessagesPage />} />
    </Routes>
  )
}
