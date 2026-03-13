import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function AshaLoginPage() {
  const [tab, setTab]     = useState('login')
  const [form, setForm]   = useState({})
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  
  const handleSubmit = async e => { 
    e.preventDefault()
    setError('')
    
    try {
      const endpoint = tab === 'login' ? '/auth/worker/login' : '/auth/worker/register'
      let payload = {}
      
      if (tab === 'login') {
        payload = {
          phone_number: form.phone,
          pin_code: form.pin_code
        }
      } else {
        payload = {
          full_name: form.fullName,
          phone_number: form.phone,
          pin_code: form.pin_code,
          village_or_region: form.village,
          primary_language: form.language
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
      localStorage.setItem('worker_token', data.token)
      localStorage.setItem('worker_id', data.id)
      localStorage.setItem('worker_name', data.full_name)
      
      navigate('/asha-dashboard') 
    } catch (err) {
      setError(err.message)
    }
  }

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
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Login</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Register</button>
        </div>

        {error && <div style={{ background: '#fee', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}

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
                <label>PIN Code</label>
                <input name="pin_code" type="password" placeholder="Enter your 4-6 digit PIN" onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-submit">Sign In →</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-heading">JOIN AROGYA</h2>
            <p className="auth-sub">Register as an ASHA worker — it's free</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" type="text" placeholder="Sunita Sharma" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Village or Region</label>
                  <input name="village" type="text" placeholder="e.g. Rampur" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Primary Language</label>
                  <select name="language" onChange={handleChange} required>
                    <option value="">Select language</option>
                    {['Hindi','English','Marathi','Gujarati','Tamil','Telugu','Kannada','Bengali','Oriya','Punjabi'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Set PIN Code</label>
                <input name="pin_code" type="password" placeholder="Create a 4-6 digit PIN" onChange={handleChange} required />
              </div>
              <button type="submit" className="auth-submit">Create Account →</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
