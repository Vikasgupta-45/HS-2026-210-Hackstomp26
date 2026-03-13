import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

export default function DoctorDashboard() {
  const [active, setActive] = useState('Dashboard')
  const [filter, setFilter] = useState('ALL') // 'ALL', 'RED', 'YELLOW', 'GREEN'
  const [consultations, setConsultations] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  
  const [prescriptionForm, setPrescriptionForm] = useState([{ medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }])

  const doctorName = localStorage.getItem('doctor_name') || 'Doctor'
  const doctorId = localStorage.getItem('doctor_id') || ''
  const navigate = useNavigate()

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/consultations/open');
      if (!res.ok) throw new Error("Failed to fetch");
      let data = await res.json();
      
      const enriched = await Promise.all(data.map(async c => {
        try {
          const p = await fetch(`http://127.0.0.1:8000/patients/${c.patient_id}`);
          const pData = await p.json();
          return { ...c, patientName: pData.full_name, patientAge: pData.age };
        } catch {
          return { ...c, patientName: c.patient_id, patientAge: '?' };
        }
      }));
      setConsultations(enriched);
    } catch (err) {
      console.error(err);
    }
  }

  const handlePrescribe = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      const payload = prescriptionForm.map(m => ({
        medicine_name: m.medicine_name,
        duration_days: parseInt(m.duration_days) || 1,
        timing_frequency: m.timing_frequency,
        notes: m.notes
      }));

      const res = await fetch(`http://127.0.0.1:8000/consultations/${selectedCase.consultation_id}/prescribe?doctor_id=${doctorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to prescribe");
      
      alert("Prescription added and case closed.");
      setSelectedCase(null);
      setPrescriptionForm([{ medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }]);
      fetchConsultations();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  const addMed = () => setPrescriptionForm([...prescriptionForm, { medicine_name: '', duration_days: '', timing_frequency: '', notes: '' }]);

  const filteredConsultations = filter === 'ALL' 
    ? consultations 
    : consultations.filter(c => c.ai_triage_level === filter);

  const KPI = [
    { filterId: 'ALL',     label:'All Patients',   num: consultations.length, icon:'people',          sub:'Total Consultations' },
    { filterId: 'RED',     label:'Urgent Cases',   num: consultations.filter(c => c.ai_triage_level==='RED').length,  icon:'warning',         sub:'Requires immediate attention' },
    { filterId: 'YELLOW',  label:'Attention',      num: consultations.filter(c => c.ai_triage_level==='YELLOW').length, icon:'event_available', sub:'Moderate severity' },
    { filterId: 'GREEN',   label:'Routine Checks', num: consultations.filter(c => c.ai_triage_level==='GREEN').length,  icon:'person_add',      sub:'Standard follow-ups' },
  ];

  return (
    <>
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">DR</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{doctorName}</span>
          <br/>
          <small>Doctor Portal</small>
        </div>

        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>Main Menu</span>
        <nav className="sidebar-nav">
          <Link to="/doctor-dashboard" className="active" style={{ fontWeight: 'normal' }}>
            <span className="material-icons">dashboard</span>Dashboard
          </Link>
        </nav>

        <span className="nav-group-label" style={{ marginTop: 8, fontWeight: 'normal' }}>Account</span>
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => { localStorage.clear() }} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:'normal', color:'var(--ink-mid)' }}>
            <span className="material-icons" style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>logout</span> Logout
          </Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dash-top">
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>DOCTOR DASHBOARD</h2>
            <p>Welcome, {doctorName}. Please review open consultations.</p>
          </div>
        </div>

        {selectedCase ? (
          <div className="dash-card">
            <div className="dash-card-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--sage-pale)', paddingBottom: 16 }}>
              <h3 style={{ fontWeight: 'normal' }}>CASE: {selectedCase.patientName}</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCase(null); }} style={{ fontWeight: 'normal' }}>← Back to List</a>
            </div>

            <div style={{ background: 'var(--sage-xpale)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <h4 style={{ marginBottom: 8, fontSize: '0.95rem' }}>Symptoms Reported</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink)' }}>{selectedCase.symptoms_text || 'No symptoms text provided.'}</p>
            </div>

            <h4 style={{ marginBottom: 16, fontWeight: 'normal', color: 'var(--ink-mid)' }}>Issue Prescription</h4>
            <form onSubmit={handlePrescribe}>
              {prescriptionForm.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: 12, marginBottom: 16 }}>
                  <input placeholder="Medicine Name" required value={med.medicine_name} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].medicine_name = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder="Days" required type="number" value={med.duration_days} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].duration_days = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder="Timing" required value={med.timing_frequency} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].timing_frequency = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                  <input placeholder="Notes (Optional)" value={med.notes} onChange={e => {
                    const newF = [...prescriptionForm]; newF[idx].notes = e.target.value; setPrescriptionForm(newF);
                  }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={addMed} className="btn btn-outline" style={{ fontWeight: 'normal', padding: '10px 16px' }}>+ Add Medicine</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 'normal', padding: '10px 16px' }}>Submit & Close Case</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              {KPI.map((k, i) => (
                <div 
                  key={i} 
                  className={`kpi-card ${filter === k.filterId ? 'active-filter' : ''}`}
                  onClick={() => setFilter(k.filterId)}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: filter === k.filterId ? 'var(--sage)' : 'rgba(125,151,114,0.12)',
                    boxShadow: filter === k.filterId ? 'var(--shadow-card)' : 'none',
                    transform: filter === k.filterId ? 'translateY(-6px)' : 'none'
                  }}
                >
                  <div className="kpi-icon"><span className="material-icons">{k.icon}</span></div>
                  <div className="kpi-label" style={{ fontWeight: 'normal' }}>{k.label}</div>
                  <div className="kpi-num" style={{ fontWeight: 'normal' }}>{k.num}</div>
                  <div className="kpi-sub" style={{ fontWeight: 'normal' }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="dash-card" style={{ marginBottom: 24 }}>
              <div className="dash-card-header">
                <h3 style={{ fontWeight: 'normal' }}>OPEN CONSULTATIONS ({filter})</h3>
                <a href="#" onClick={(e) => { e.preventDefault(); fetchConsultations(); }} style={{ fontWeight: 'normal' }}>Refresh</a>
              </div>
              
              {filteredConsultations.length === 0 ? (
                <p style={{ color: 'var(--ink-light)', padding: '20px 0' }}>No patients found for this filter.</p>
              ) : (
                filteredConsultations.map((c, i) => {
                  let badgeClass = c.ai_triage_level === 'RED' ? 'badge-urgent' : c.ai_triage_level === 'YELLOW' ? 'badge-new' : 'badge-routine';
                  return (
                    <div key={i} className="consult-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="consult-avatar" style={{ fontWeight: 'normal' }}>{c.patientName ? c.patientName.substring(0,2).toUpperCase() : '??'}</div>
                        <div className="consult-info">
                          <span style={{ display:'block', fontSize:'0.88rem', color:'var(--ink)', fontWeight: 'normal' }}>{c.patientName}</span>
                          <small>Age: {c.patientAge} · Triage: {c.ai_triage_level}</small>
                        </div>
                        <span className={`consult-badge ${badgeClass}`} style={{ fontWeight: 'normal' }}>{c.ai_triage_level}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setSelectedCase(c)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding:'8px 16px', borderRadius:99, border:'1px solid var(--sage-light)', background:'transparent', color:'var(--sage-dark)', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:'normal', cursor:'pointer', transition:'all 0.3s' }}>
                          <span className="material-icons" style={{ fontSize: '1rem' }}>visibility</span>
                          Review & Prescribe
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
    </>
  )
}
