import { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function AshaDashboard() {
  const [tab, setTab] = useState('search') // 'search', 'add', 'consult'
  const [aadharSearch, setAadharSearch] = useState('')
  const [searchedPatient, setSearchedPatient] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (aadharSearch.length > 5) {
      setSearchedPatient({
        name: 'Ram Singh',
        age: 45,
        history: 'Diabetes Type 2, Hypertension',
        lastVisit: '10 Feb 2026'
      })
    } else {
      alert("Please enter a valid Aadhar number for the demo.")
    }
  }

  const handleStartConsultation = () => {
    setTab('consult')
  }

  return (
    <div className="dashboard-layout" style={{ background: 'var(--sage-xpale)', minHeight: '100vh' }}>
      
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA ASHA</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar" style={{ background: 'var(--ink-light)' }}>SS</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>Sunita Sharma</span>
          <br/>
          <small>ASHA Worker · Rajasthan</small>
        </div>

        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>Actions</span>
        <nav className="sidebar-nav">
          <a href="#" className={tab === 'search' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setTab('search')}} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">search</span> Search Patient
          </a>
          <a href="#" className={tab === 'add' ? 'active' : ''} onClick={(e) => {e.preventDefault(); setTab('add'); setSearchedPatient(null)}} style={{ fontWeight: 'normal' }}>
            <span className="material-icons">person_add</span> Add New Patient
          </a>
        </nav>
        
        <span className="nav-group-label" style={{ marginTop: 8, fontWeight: 'normal' }}>Account</span>
        <nav className="sidebar-nav">
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:'normal', color:'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>logout</span> Logout
          </Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        <div className="dash-top" style={{ marginBottom: 36 }}>
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>ASHA FIELD DASHBOARD</h2>
            <p>Ready to assist patients in your village.</p>
          </div>
        </div>

        {tab === 'search' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal' }}>SEARCH EXISTING PATIENT</h3>
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <input 
                type="text" 
                placeholder="Enter 12-digit Aadhar Number" 
                value={aadharSearch}
                onChange={e => setAadharSearch(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 14, fontFamily: 'var(--font-body)', fontSize: '0.93rem', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 'normal', borderRadius: 14 }}>
                <span className="material-icons">search</span> Find
              </button>
            </form>

            {searchedPatient && (
              <div style={{ background: 'var(--sage-pale)', padding: 24, borderRadius: 20, border: '1px solid var(--sage-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--ink)', marginBottom: 4 }}>{searchedPatient.name}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-mid)', marginBottom: 16 }}>Age: {searchedPatient.age} · Last Visit: {searchedPatient.lastVisit}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}><strong>Known History:</strong> {searchedPatient.history}</p>
                  </div>
                  <button onClick={handleStartConsultation} className="btn btn-primary" style={{ fontWeight: 'normal' }}>
                    Start Consultation →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 style={{ fontWeight: 'normal' }}>REGISTER NEW PATIENT</h3>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSearchedPatient({ name: e.target.pname.value, age: e.target.page.value, history: 'None', lastVisit: 'First Visit' }); setTab('search') }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Full Name</label>
                  <input name="pname" type="text" placeholder="Patient Name" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Age</label>
                  <input name="page" type="number" placeholder="Age in years" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Gender</label>
                  <select style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none', background: 'white' }} required>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Aadhar Number</label>
                  <input type="text" placeholder="12-digit Aadhar" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 'normal' }}>
                Register & Start Consultation
              </button>
            </form>
          </div>
        )}

        {tab === 'consult' && searchedPatient && (
          <div className="dash-card">
            <div className="dash-card-header" style={{ borderBottom: '1px solid var(--sage-pale)', paddingBottom: 16, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 'normal' }}>CONSULTATION: {searchedPatient.name.toUpperCase()}</h3>
              <a href="#" onClick={(e) => {e.preventDefault(); setTab('search')}} style={{ fontWeight: 'normal', color: 'var(--ink-light)' }}>← Back</a>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', color: 'var(--ink)' }}>Patient Symptoms</label>
              <textarea 
                placeholder="Describe the symptoms in detail (e.g. High fever since 3 days, dry cough...)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ width: '100%', minHeight: '120px', padding: '16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 16, fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 40 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '0.9rem', color: 'var(--ink)' }}>Upload Disease Image / Reports</label>
              <div style={{ border: '2px dashed var(--sage-light)', borderRadius: 16, padding: '32px', textAlign: 'center', background: 'var(--sage-xpale)', cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--sage)', marginBottom: 12 }}>cloud_upload</span>
                <p style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', margin: 0 }}>Tap to capture photo or select from gallery</p>
                <p style={{ color: 'var(--ink-light)', fontSize: '0.75rem', marginTop: 8 }}>Supports JPG, PNG</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--cream)', padding: 24, borderRadius: 20, border: '1px solid var(--sage-pale)' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 'normal', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 4 }}>Connect with Doctor</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', margin: 0 }}>Initiate a live teleconsultation session with an available specialist.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                 <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', padding: '12px 20px', borderRadius: 16 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>call</span> Audio
                  </button>
                  <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', padding: '12px 20px', borderRadius: 16 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>videocam</span> Video Call
                  </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
