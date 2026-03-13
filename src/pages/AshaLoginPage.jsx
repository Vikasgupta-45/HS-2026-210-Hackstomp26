import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function AshaLoginPage() {
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({})

  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = e => { e.preventDefault(); navigate('/asha-dashboard') }

  return (
    <div className="auth-page">
      {/* Left visual panel */}
      <aside className="auth-side-visual">
        <div className="auth-brand">
          <div className="logo-icon">
            <LogoIcon size={72} color="white" />
          </div>
          <span className="logo-text">AROGYA</span>
          <p>Empowering ASHA workers with technology to deliver better healthcare to every village.</p>
        </div>

        <div className="auth-visual-cards">
          {[
            { icon:'people',          title:'12,000+ ASHA Workers',   sub:'Nationwide network' },
            { icon:'phone_android',   title:'Works on any phone',      sub:'Android & iOS' },
            { icon:'translate',       title:'11 Indian languages',     sub:'Fully multilingual' },
          ].map((c, i) => (
            <div key={i} className="auth-vcard">
              <span className="material-icons">{c.icon}</span>
              <div>
                <strong>{c.title}</strong>
                <small>{c.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-form-side">
        {/* Back link */}
        <Link to="/" style={{ fontSize:'0.85rem', color:'var(--sage-dark)', fontWeight:600, marginBottom:32, display:'inline-flex', alignItems:'center', gap:6 }}>
          ← Back to Home
        </Link>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Login</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        {tab === 'login' ? (
          <>
            <h2 className="auth-heading">WELCOME BACK</h2>
            <p className="auth-sub">Sign in to your ASHA worker account</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" placeholder="Enter your password" onChange={handleChange} required />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.82rem' }}>
                <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer', color:'var(--ink-light)' }}>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" style={{ color:'var(--sage-dark)', fontWeight:600 }}>Forgot password?</a>
              </div>
              <button type="submit" className="auth-submit">Sign In →</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-heading">JOIN AROGYA</h2>
            <p className="auth-sub">Register as an ASHA worker — it's free</p>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" type="text" placeholder="Sunita" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" type="text" placeholder="Sharma" onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>ASHA Worker ID (from your certificate)</label>
                <input name="ashaId" type="text" placeholder="e.g. RJ-2024-00123" onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <select name="state" onChange={handleChange} required>
                    <option value="">Select state</option>
                    {['Rajasthan','Uttar Pradesh','Madhya Pradesh','Bihar','Jharkhand','Odisha','Maharashtra','Karnataka','Tamil Nadu','Andhra Pradesh','Telangana','Gujarat','West Bengal','Assam','Chhattisgarh','Uttarakhand','Himachal Pradesh','Punjab'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input name="district" type="text" placeholder="Your district" onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" placeholder="Create a strong password" onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-submit">Create Account →</button>
            </form>
          </>
        )}

        <p style={{ marginTop:24, fontSize:'0.82rem', color:'var(--ink-light)', textAlign:'center' }}>
          Need help? <a href="#" style={{ color:'var(--sage-dark)', fontWeight:600 }}>Contact support</a>
        </p>
      </div>
    </div>
  )
}
