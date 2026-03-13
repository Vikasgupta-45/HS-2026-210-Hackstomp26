import { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function AshaDashboard() {
  const [tab, setTab] = useState('search') // 'search', 'add', 'consult'
  const [aadharSearch, setAadharSearch] = useState('')
  const [searchedPatient, setSearchedPatient] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const workerName = localStorage.getItem('worker_name') || 'ASHA Worker'
  
  const handleSearch = async (e) => {
    e.preventDefault()
    if (aadharSearch.length > 5) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/patients/${aadharSearch}`);
        if (!res.ok) throw new Error("Patient not found");
        const data = await res.json();
        setSearchedPatient({
          patient_id: data.patient_id,
          name: data.full_name,
          age: data.age,
          gender: data.gender,
          contact_number: data.contact_number,
          history: 'Available in records',
          lastVisit: 'Recent',
          isNew: false
        })
      } catch (err) {
        alert("Patient not found. Please register them in the Add New Patient tab.");
      }
    } else {
      alert("Please enter a valid Aadhar number.")
    }
  }

  const handleStartConsultation = () => {
    setTab('consult')
  }

  const submitConsultation = async () => {
    if (!symptoms) return alert("Please enter symptoms.");
    const consultationId = 'CONS-' + Date.now();
    const workerId = localStorage.getItem('worker_id') || 'worker_default';

    const payload = {
      worker_id: workerId,
      patients: searchedPatient.isNew ? [{
        patient_id: searchedPatient.patient_id,
        registered_by_worker_id: workerId,
        full_name: searchedPatient.name,
        age: searchedPatient.age,
        gender: searchedPatient.gender,
        contact_number: searchedPatient.contact_number || ''
      }] : [],
      consultations: [{
        consultation_id: consultationId,
        patient_id: searchedPatient.patient_id,
        worker_id: workerId,
        symptoms_text: symptoms,
        symptoms_audio_path: '',
        photo_paths: ''
      }]
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/sync/offline-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Sync failed");
      alert("Case submitted successfully for doctor review!");
      setTab('search');
      setSearchedPatient(null);
      setSymptoms('');
      setAadharSearch('');
    } catch (err) {
      alert("Error: " + err.message);
    }
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
          <div className="sidebar-avatar" style={{ background: 'var(--ink-light)' }}>AW</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{workerName}</span>
          <br/>
          <small>ASHA Worker</small>
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
          <Link to="/" onClick={() => { localStorage.clear() }} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:'normal', color:'var(--ink-mid)' }}>
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
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-mid)', marginBottom: 16 }}>Age: {searchedPatient.age} · Gender: {searchedPatient.gender}</p>
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
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                setSearchedPatient({ 
                  patient_id: e.target.aadhar.value,
                  name: e.target.pname.value, 
                  age: parseInt(e.target.page.value), 
                  gender: e.target.gender.value,
                  contact_number: e.target.phone.value,
                  history: 'None reported', 
                  lastVisit: 'First Visit',
                  isNew: true 
                }); 
                setTab('consult') 
              }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Gender</label>
                  <select name="gender" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none', background: 'white' }} required>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Aadhar Number</label>
                  <input name="aadhar" type="text" placeholder="12-digit Aadhar" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} required />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'var(--ink-mid)' }}>Contact Number (Optional)</label>
                <input name="phone" type="text" placeholder="Contact number" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid rgba(0,206,209,0.25)', borderRadius: 12, outline: 'none' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontWeight: 'normal' }}>
                Register Profile & Continue to Consultation
              </button>
            </form>
          </div>
        )}

        {tab === 'consult' && searchedPatient && (
          <div className="dash-card">
            <div className="dash-card-header" style={{ borderBottom: '1px solid var(--sage-pale)', paddingBottom: 16, marginBottom: 24 }}>
              <h3 style={{ fontWeight: 'normal' }}>CONSULTATION: {searchedPatient.name.toUpperCase()}</h3>
              <a href="#" onClick={(e) => {e.preventDefault(); setTab('search')}} style={{ fontWeight: 'normal', color: 'var(--ink-light)' }}>← Cancel</a>
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
                <h4 style={{ fontWeight: 'normal', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 4 }}>Submit for Doctor Review</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', margin: 0 }}>Sync this patient case so a doctor can triage and prescribe medicine.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={submitConsultation} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'normal', padding: '12px 20px', borderRadius: 16 }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>cloud_upload</span> Sync Case
                  </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
