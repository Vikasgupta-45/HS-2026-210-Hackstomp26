import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

const NAV = [
  { icon:'dashboard',        label:'Dashboard',    href:'#' },
  { icon:'group',            label:'Patients',     href:'#' },
  { icon:'calendar_today',   label:'Schedule',     href:'#' },
  { icon:'description',      label:'Prescriptions',href:'#' },
  { icon:'analytics',        label:'Reports',      href:'#' },
  { icon:'message',          label:'Messages',     href:'#' },
]

const KPI = [
  { label:'Patients Today', num:'28',    unit:'',       icon:'people',          sub:'↑ 4 from yesterday' },
  { label:'Avg. Wait Time', num:'14',    unit:' mins',  icon:'timer',           sub:'↓ 2 mins improved'  },
  { label:'Live Sessions',  num:'04',    unit:'',       icon:'video_call',      sub:'3 queued'           },
  { label:'Pending Tasks',  num:'12',    unit:'',       icon:'pending_actions', sub:'5 urgent'           },
]

const CONSULTATIONS = [
  { init:'RK', name:'Ramesh Kumar',    info:'Age 62 · Chest Pain',       badge:'badge-urgent',  label:'URGENT' },
  { init:'PD', name:'Priya Devi',      info:'Age 28 · Prenatal Check',   badge:'badge-routine', label:'ROUTINE' },
  { init:'AS', name:'Arjun Singh',     info:'Age 45 · Diabetes Follow',  badge:'badge-routine', label:'ROUTINE' },
  { init:'ML', name:'Meena Lal',       info:'Age 35 · Fever & Cough',    badge:'badge-new',     label:'NEW' },
  { init:'SK', name:'Sundar Kumar',    info:'Age 52 · Hypertension',     badge:'badge-routine', label:'ROUTINE' },
]

const SCHEDULE = [
  { time:'09:00', name:'Kavita Rao',    type:'Cardiology Review' },
  { time:'09:45', name:'Rajan Mehta',   type:'Post-Op Follow-Up' },
  { time:'11:00', name:'Anita Singh',   type:'Prenatal Consult'  },
  { time:'13:30', name:'Dev Sharma',    type:'Diabetes Check'    },
  { time:'15:00', name:'Priya Nair',    type:'General Medicine'  },
]

export default function DoctorDashboard() {
  const [active, setActive] = useState('Dashboard')

  return (
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon"><LogoIcon size={38} /></div>
          <span className="logo-text">AROGYA</span>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">SJ</div>
          <h4>Dr. Sarah Jenkins</h4>
          <small>Senior Cardiologist</small>
        </div>

        <span className="nav-group-label">Main Menu</span>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              className={active === n.label ? 'active' : ''}
              onClick={e => { e.preventDefault(); setActive(n.label) }}
            >
              <span className="material-icons">{n.icon}</span>
              {n.label}
            </a>
          ))}
        </nav>

        <span className="nav-group-label" style={{ marginTop: 8 }}>Settings</span>
        <nav className="sidebar-nav">
          <a href="#"><span className="material-icons">settings</span>Preferences</a>
          <a href="#"><span className="material-icons">help_outline</span>Help</a>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 24px', fontSize:'0.88rem', fontWeight:500, color:'var(--ink-mid)', borderRadius:'0 var(--radius-pill) var(--radius-pill) 0', marginRight:12, transition:'all 0.3s' }}>
            <span className="material-icons" style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>logout</span>Back to Site
          </Link>
        </nav>

        <div className="sidebar-storage">
          <strong>Storage Usage</strong>
          <div className="storage-bar-bg"><div className="storage-bar-fill" /></div>
          <p>6.5 GB of 10 GB used</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dash-top">
          <div className="dash-greet">
            <h2>GOOD MORNING, DR. JENKINS</h2>
            <p>Thursday, 13 March 2026 · 28 consultations scheduled today</p>
          </div>
          <div className="dash-actions">
            <button className="btn btn-outline" style={{ padding:'10px 20px', fontSize:'0.85rem' }}>
              <span className="material-icons" style={{ fontSize:'1.1rem' }}>notifications</span> Alerts (5)
            </button>
            <button className="btn btn-primary" style={{ padding:'10px 20px', fontSize:'0.85rem' }}>
              <span className="material-icons" style={{ fontSize:'1.1rem' }}>video_call</span> New Consult
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpi-grid">
          {KPI.map((k, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-icon"><span className="material-icons">{k.icon}</span></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-num">{k.num}<span style={{ fontSize:'1.2rem', color:'var(--ink-light)' }}>{k.unit}</span></div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Consultation + Schedule */}
        <div className="dash-grid">
          {/* Pending consultations */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>PENDING CONSULTATIONS</h3>
              <a href="#">View all →</a>
            </div>
            {CONSULTATIONS.map((c, i) => (
              <div key={i} className="consult-item">
                <div className="consult-avatar">{c.init}</div>
                <div className="consult-info">
                  <strong>{c.name}</strong>
                  <small>{c.info}</small>
                </div>
                <span className={`consult-badge ${c.badge}`}>{c.label}</span>
                <button style={{ marginLeft:8, padding:'6px 16px', borderRadius:99, border:'none', background:'var(--sage-dark)', color:'#fff', fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.3s' }}>
                  Join
                </button>
              </div>
            ))}
          </div>

          {/* Today's schedule */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>TODAY'S SCHEDULE</h3>
              <a href="#">Full Calendar →</a>
            </div>
            {SCHEDULE.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom: i < SCHEDULE.length-1 ? '1px solid var(--sage-pale)' : 'none' }}>
                <div style={{ width:52, textAlign:'center', background:'var(--sage-pale)', borderRadius:12, padding:'6px 0' }}>
                  <span style={{ fontFamily:'var(--font-head)', fontSize:'0.88rem', color:'var(--sage-dark)' }}>{s.time}</span>
                </div>
                <div style={{ flex:1 }}>
                  <strong style={{ display:'block', fontSize:'0.88rem', color:'var(--ink)' }}>{s.name}</strong>
                  <small style={{ fontSize:'0.75rem', color:'var(--ink-light)' }}>{s.type}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient health overview */}
        <div className="dash-card" style={{ marginTop: 0 }}>
          <div className="dash-card-header">
            <h3>PATIENT HEALTH OVERVIEW</h3>
            <a href="#">All Patients →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { label:'Critical Patients',   num:3,   color:'#C0392B', bg:'#FFE8E8' },
              { label:'Stable Patients',     num:18,  color:'var(--sage-dark)', bg:'var(--sage-pale)' },
              { label:'Recovering',          num:7,   color:'#2980B9', bg:'#E8F4FD' },
            ].map((stat, i) => (
              <div key={i} style={{ padding:24, background:stat.bg, borderRadius:20, textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:'2.2rem', color:stat.color, lineHeight:1 }}>{stat.num}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--ink-mid)', marginTop:8, fontWeight:600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
