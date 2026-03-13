import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function DoctorAuthPage() {
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  
  const handleSubmit = async e => { 
    e.preventDefault()
    setError('')
    
    try {
      const endpoint = tab === 'login' ? '/auth/doctor/login' : '/auth/doctor/register'
      let payload = {}
      
      if (tab === 'login') {
        payload = {
          email: form.email,
          password: form.password
        }
      } else {
        payload = {
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          hospital_name: form.hospital || ''
        }
      }

      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Authentication failed')
      }

      const data = await res.json()
      localStorage.setItem('doctor_token', data.token)
      localStorage.setItem('doctor_id', data.id)
      localStorage.setItem('doctor_name', data.full_name)
      
      navigate('/doctor-dashboard') 
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      {/* Left visual panel */}
      <aside className="auth-side-visual" style={{ background: 'linear-gradient(160deg, var(--sage-dark) 0%, var(--ink-light) 100%)' }}>
        <div className="auth-brand">
          <div className="logo-icon">
            <LogoIcon size={72} color="white" />
          </div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA FOR DOCTORS</span>
          <p>Join our network of medical professionals delivering remote healthcare across India.</p>
        </div>

        <div className="auth-visual-cards">
          {[
            { icon:'health_and_safety', title:'Verified Network',   sub:'Trusted by thousands of peers' },
            { icon:'schedule',          title:'Flexible Hours',     sub:'Consult when you are available' },
            { icon:'monetization_on',   title:'Guaranteed Payouts', sub:'Timely compensation for your time' },
          ].map((c, i) => (
            <div key={i} className="auth-vcard">
              <span className="material-icons">{c.icon}</span>
              <div>
                <strong style={{ fontWeight: 600 }}>{c.title}</strong>
                <small>{c.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-form-side">
        {/* Back link */}
        <Link to="/" style={{ fontSize:'0.85rem', color:'var(--sage-dark)', fontWeight: 'normal', marginBottom:32, display:'inline-flex', alignItems:'center', gap:6 }}>
          ← Back to Home
        </Link>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }} style={{ fontWeight: 'normal' }}>Login</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError('') }} style={{ fontWeight: 'normal' }}>Register</button>
        </div>

        {error && <div style={{ background: '#fee', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}

        {tab === 'login' ? (
          <>
            <h2 className="auth-heading" style={{ fontWeight: 'normal' }}>DOCTOR LOGIN</h2>
            <p className="auth-sub" style={{ fontWeight: 'normal' }}>Sign in to access your clinic dashboard</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>Email Address</label>
                <input name="email" type="email" placeholder="dr.smith@example.com" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>Password</label>
                <input name="password" type="password" placeholder="Enter your password" onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-submit" style={{ fontWeight: 'normal' }}>Sign In To Dashboard →</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-heading" style={{ fontWeight: 'normal' }}>JOIN AS DOCTOR</h2>
            <p className="auth-sub" style={{ fontWeight: 'normal' }}>Register to provide remote consultations</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Full Name</label>
                  <input name="fullName" type="text" placeholder="Dr. Sarah Jenkins" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Specialization</label>
                  <select name="specialization" onChange={handleChange} required>
                    <option value="">Select primary specialty</option>
                    {['General Medicine','Cardiology','Pediatrics','Gynecology','Dermatology','Orthopedics','Psychiatry'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>Hospital / Clinic Affiliation (Optional)</label>
                <input name="hospital" type="text" placeholder="City General Hospital" onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Email Address</label>
                  <input name="email" type="email" placeholder="doctor@example.com" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Password</label>
                  <input name="password" type="password" placeholder="Create a strong password" onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="auth-submit" style={{ fontWeight: 'normal' }}>Register & Continue →</button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
