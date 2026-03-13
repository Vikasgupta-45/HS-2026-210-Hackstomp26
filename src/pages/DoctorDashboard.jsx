import { useState } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

const NAV = [
  { icon:'dashboard',        label:'Dashboard',    href:'/doctor-dashboard' },
  { icon:'description',      label:'Prescriptions',href:'/doctor/prescriptions' },
  { icon:'analytics',        label:'Reports',      href:'/doctor/reports' },
  { icon:'message',          label:'Messages',     href:'/doctor/messages' },
]

// KPI cards will serve as filter buttons. The "filterId" matches the badge label value (or 'ALL')
const KPI = [
  { filterId: 'ALL',     label:'All Patients',   num:'28', icon:'people',          sub:'Total Consultations' },
  { filterId: 'URGENT',  label:'Urgent Cases',   num:'5',  icon:'warning',         sub:'Requires immediate attention' },
  { filterId: 'ROUTINE', label:'Routine Checks', num:'18', icon:'event_available', sub:'Standard follow-ups' },
  { filterId: 'NEW',     label:'New Patients',   num:'5',  icon:'person_add',      sub:'First-time visits' },
]

const CONSULTATIONS = [
  { init:'RK', name:'Ramesh Kumar',    info:'Age 62 · Chest Pain',       badge:'badge-urgent',  label:'URGENT' },
  { init:'PD', name:'Priya Devi',      info:'Age 28 · Prenatal Check',   badge:'badge-routine', label:'ROUTINE' },
  { init:'AS', name:'Arjun Singh',     info:'Age 45 · Diabetes Follow',  badge:'badge-routine', label:'ROUTINE' },
  { init:'ML', name:'Meena Lal',       info:'Age 35 · Fever & Cough',    badge:'badge-new',     label:'NEW' },
  { init:'SK', name:'Sundar Kumar',    info:'Age 52 · Hypertension',     badge:'badge-routine', label:'ROUTINE' },
]

export default function DoctorDashboard() {
  const [active, setActive] = useState('Dashboard')
  const [filter, setFilter] = useState('ALL') // Default filter shows all

  const filteredConsultations = filter === 'ALL' 
    ? CONSULTATIONS 
    : CONSULTATIONS.filter(c => c.label === filter)

  return (
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text" style={{ fontWeight: 'normal' }}>AROGYA</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">SJ</div>
          <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>Dr. Sarah Jenkins</span>
          <br/>
          <small>Senior Cardiologist</small>
        </div>

        <span className="nav-group-label" style={{ fontWeight: 'normal' }}>Main Menu</span>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <Link
              key={n.label}
              to={n.href}
              className={active === n.label ? 'active' : ''}
              onClick={() => setActive(n.label)}
              style={{ fontWeight: 'normal' }}
            >
              <span className="material-icons">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <span className="nav-group-label" style={{ marginTop: 8, fontWeight: 'normal' }}>Settings</span>
        <nav className="sidebar-nav">
          <a href="#" style={{ fontWeight: 'normal' }}><span className="material-icons">settings</span>Preferences</a>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dash-top">
          <div className="dash-greet">
            <h2 style={{ fontWeight: 'normal' }}>GOOD MORNING, DR. JENKINS</h2>
            <p>Thursday, 13 March 2026</p>
          </div>
          <div className="dash-actions">
            <button className="btn btn-outline" style={{ padding:'10px 20px', fontSize:'0.85rem', fontWeight: 'normal' }}>
              <span className="material-icons" style={{ fontSize:'1.1rem' }}>notifications</span> Alerts (5)
            </button>
            <button className="btn btn-primary" style={{ padding:'10px 20px', fontSize:'0.85rem', fontWeight: 'normal' }}>
              <span className="material-icons" style={{ fontSize:'1.1rem' }}>video_call</span> New Consult
            </button>
          </div>
        </div>

        {/* KPI cards for Filtering */}
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

        {/* Consultations List (Broadened to full width) */}
        <div className="dash-card" style={{ marginBottom: 24 }}>
          <div className="dash-card-header">
            <h3 style={{ fontWeight: 'normal' }}>PENDING CONSULTATIONS ({filter})</h3>
            <a href="#" style={{ fontWeight: 'normal' }}>View all →</a>
          </div>
          
          {filteredConsultations.length === 0 ? (
            <p style={{ color: 'var(--ink-light)', padding: '20px 0' }}>No patients found for this filter.</p>
          ) : (
            filteredConsultations.map((c, i) => (
              <div key={i} className="consult-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="consult-avatar" style={{ fontWeight: 'normal' }}>{c.init}</div>
                  <div className="consult-info">
                    <span style={{ display:'block', fontSize:'0.88rem', color:'var(--ink)', fontWeight: 'normal' }}>{c.name}</span>
                    <small>{c.info}</small>
                  </div>
                  <span className={`consult-badge ${c.badge}`} style={{ fontWeight: 'normal' }}>{c.label}</span>
                </div>
                
                {/* Action Buttons Container */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding:'8px 16px', borderRadius:99, border:'1px solid var(--sage-light)', background:'transparent', color:'var(--sage-dark)', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:'normal', cursor:'pointer', transition:'all 0.3s' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>videocam</span>
                    Video Call
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding:'8px 16px', borderRadius:99, border:'1px solid var(--sage-light)', background:'transparent', color:'var(--sage-dark)', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:'normal', cursor:'pointer', transition:'all 0.3s' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>call</span>
                    Audio Call
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding:'8px 16px', borderRadius:99, border:'none', background:'var(--sage-pale)', color:'var(--sage-dark)', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:'normal', cursor:'pointer', transition:'all 0.3s' }}>
                    <span className="material-icons" style={{ fontSize: '1rem' }}>prescriptions</span>
                    Prescription
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Patient health overview */}
        <div className="dash-card" style={{ marginTop: 0 }}>
          <div className="dash-card-header">
            <h3 style={{ fontWeight: 'normal' }}>PATIENT HEALTH OVERVIEW</h3>
            <a href="#" style={{ fontWeight: 'normal' }}>All Patients →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { label:'Critical Patients',   num:3,   color:'#C0392B', bg:'#FFE8E8' },
              { label:'Stable Patients',     num:18,  color:'var(--sage-dark)', bg:'var(--sage-pale)' },
              { label:'Recovering',          num:7,   color:'#2980B9', bg:'#E8F4FD' },
            ].map((stat, i) => (
              <div key={i} style={{ padding:24, background:stat.bg, borderRadius:20, textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:'2.2rem', color:stat.color, lineHeight:1, fontWeight: 'normal' }}>{stat.num}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--ink-mid)', marginTop:8, fontWeight:'normal' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
