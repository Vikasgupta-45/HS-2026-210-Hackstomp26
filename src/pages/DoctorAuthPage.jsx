import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function DoctorAuthPage() {
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({})
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  
  const handleSubmit = e => { 
    e.preventDefault()
    // Simulate auth
    navigate('/doctor-dashboard') 
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
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')} style={{ fontWeight: 'normal' }}>Login</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')} style={{ fontWeight: 'normal' }}>Register</button>
        </div>

        {tab === 'login' ? (
          <>
            <h2 className="auth-heading" style={{ fontWeight: 'normal' }}>DOCTOR LOGIN</h2>
            <p className="auth-sub" style={{ fontWeight: 'normal' }}>Sign in to access your clinic dashboard</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>Email Address / Phone Number</label>
                <input name="contact" type="text" placeholder="dr.smith@example.com" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 'normal' }}>Password</label>
                <input name="password" type="password" placeholder="Enter your password" onChange={handleChange} required />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.82rem' }}>
                <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer', color:'var(--ink-light)', fontWeight: 'normal' }}>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" style={{ color:'var(--sage-dark)', fontWeight:'normal' }}>Forgot password?</a>
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
                  <label style={{ fontWeight: 'normal' }}>First Name</label>
                  <input name="firstName" type="text" placeholder="Sarah" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Last Name</label>
                  <input name="lastName" type="text" placeholder="Jenkins" onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>Medical License Number</label>
                  <input name="license" type="text" placeholder="e.g. MCI-12345" onChange={handleChange} required />
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

        <p style={{ marginTop:24, fontSize:'0.82rem', color:'var(--ink-light)', textAlign:'center' }}>
           <a href="#" style={{ color:'var(--sage-dark)', fontWeight:'normal' }}>Back to Home</a>
        </p>
      </div>
    </div>
  )
}
