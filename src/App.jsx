import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AshaLoginPage from './pages/AshaLoginPage'
import DoctorDashboard from './pages/DoctorDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/asha-login" element={<AshaLoginPage />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
    </Routes>
  )
}
