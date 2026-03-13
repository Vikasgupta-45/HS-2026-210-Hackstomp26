import { Link } from 'react-router-dom'
import LogoIcon from '../components/LogoIcon'

function DashboardHeader({ title }) {
  return (
    <div className="dash-top" style={{ marginBottom: 36 }}>
      <div className="dash-greet">
        <h2 style={{ fontWeight: 'normal' }}>{title}</h2>
        <p>This module is currently under development.</p>
      </div>
      <div className="dash-actions">
        <Link to="/doctor-dashboard" className="btn btn-outline" style={{ padding:'10px 20px', fontSize:'0.85rem', fontWeight: 'normal' }}>
          <span className="material-icons" style={{ fontSize:'1.1rem' }}>arrow_back</span> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

function DoctorSidebar() {
  return (
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
        <Link to="/doctor-dashboard" style={{ fontWeight: 'normal' }}><span className="material-icons">dashboard</span>Dashboard</Link>
        <Link to="/doctor/prescriptions" style={{ fontWeight: 'normal' }}><span className="material-icons">description</span>Prescriptions</Link>
        <Link to="/doctor/reports" style={{ fontWeight: 'normal' }}><span className="material-icons">analytics</span>Reports</Link>
        <Link to="/doctor/messages" style={{ fontWeight: 'normal' }}><span className="material-icons">message</span>Messages</Link>
      </nav>

      <span className="nav-group-label" style={{ marginTop: 8, fontWeight: 'normal' }}>Settings</span>
      <nav className="sidebar-nav">
        <a href="#" style={{ fontWeight: 'normal' }}><span className="material-icons">settings</span>Preferences</a>
      </nav>
    </aside>
  )
}

export function PrescriptionsPage() {
  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      <main className="dashboard-main">
        <DashboardHeader title="PATIENT PRESCRIPTIONS" />
        <div className="dash-card">
          <p style={{ color: 'var(--ink-light)', padding: '20px 0', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--sage-pale)', marginBottom: 16, display: 'block' }}>history_edu</span>
            E-prescription module coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}

export function ReportsPage() {
  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      <main className="dashboard-main">
        <DashboardHeader title="HEALTH ANALYTICS & REPORTS" />
        <div className="dash-card">
          <p style={{ color: 'var(--ink-light)', padding: '20px 0', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--sage-pale)', marginBottom: 16, display: 'block' }}>insert_chart</span>
            Advanced reporting module coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}

export function MessagesPage() {
  return (
    <div className="dashboard-layout">
      <DoctorSidebar />
      <main className="dashboard-main">
        <DashboardHeader title="SECURE MESSAGING" />
        <div className="dash-card">
          <p style={{ color: 'var(--ink-light)', padding: '20px 0', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: '4rem', color: 'var(--sage-pale)', marginBottom: 16, display: 'block' }}>forum</span>
            Secure messaging module coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}
