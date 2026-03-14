import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'

const API = 'http://127.0.0.1:8000'

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
  } catch {
    return d
  }
}

export default function UserDashboard() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const aadhaar = localStorage.getItem('user_aadhaar')
  const userName = localStorage.getItem('user_name')
  const token = localStorage.getItem('user_token')

  const [reminders, setReminders] = useState([])
  const [remindersLoading, setRemindersLoading] = useState(true)
  const [bookNote, setBookNote] = useState('')
  const [bookLoading, setBookLoading] = useState(false)
  const [bookSuccess, setBookSuccess] = useState('')
  const [bookError, setBookError] = useState('')

  useEffect(() => {
    if (!token || !aadhaar) {
      navigate('/user-login')
      return
    }
    fetch(`${API}/user/reminders/${aadhaar}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setReminders)
      .catch(() => setReminders([]))
      .finally(() => setRemindersLoading(false))
  }, [aadhaar, token, navigate])

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_aadhaar')
    localStorage.removeItem('user_name')
    navigate('/user-login')
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    setBookError('')
    setBookSuccess('')
    setBookLoading(true)
    try {
      const res = await fetch(`${API}/video-call-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: aadhaar, requested_by_worker_id: null, notes: bookNote || null }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Could not create request.')
      }
      setBookSuccess(t('user_book_success') || 'Video call request sent. A doctor will respond soon.')
      setBookNote('')
    } catch (err) {
      setBookError(err.message)
    } finally {
      setBookLoading(false)
    }
  }

  if (!token || !aadhaar) return null

  return (
    <div className="user-dashboard-wrap">
      <header className="user-dashboard-header">
        <Link to="/" className="user-dashboard-logo">
          <LogoIcon size={36} color="var(--sage-dark)" />
          <span>AROGYA</span>
        </Link>
        <div className="user-dashboard-user">
          <span>{userName || 'User'}</span>
          <button type="button" className="user-dashboard-out" onClick={handleLogout}>
            {t('logout') || 'Logout'}
          </button>
        </div>
      </header>

      <main className="user-dashboard-main">
        <h1 className="user-dashboard-welcome">
          {t('user_dashboard_welcome') || 'Welcome'}, {userName || 'User'}
        </h1>

        <section className="user-dashboard-cards">
          <div className="user-dashboard-card user-dashboard-card-book">
            <div className="user-dashboard-card-icon">
              <span className="material-icons">video_call</span>
            </div>
            <h2>{t('user_book_title') || 'Book doctor appointment / video call'}</h2>
            <p className="user-dashboard-card-sub">{t('user_book_sub') || 'Request a video call with a doctor. You will be notified when they accept.'}</p>
            <form onSubmit={handleBookAppointment}>
              <textarea
                placeholder={t('user_book_notes_placeholder') || 'Optional: add a note (e.g. symptoms or reason)'}
                value={bookNote}
                onChange={(e) => setBookNote(e.target.value)}
                rows={2}
                className="user-dashboard-textarea"
              />
              {bookError && <p className="user-dashboard-err">{bookError}</p>}
              {bookSuccess && <p className="user-dashboard-ok">{bookSuccess}</p>}
              <button type="submit" className="user-dashboard-btn user-dashboard-btn-primary" disabled={bookLoading}>
                {bookLoading ? (t('loading') || 'Loading…') : (t('user_book_btn') || 'Request video call')}
              </button>
            </form>
          </div>

          <div className="user-dashboard-card">
            <div className="user-dashboard-card-icon">
              <span className="material-icons">history_edu</span>
            </div>
            <h2>{t('user_past_records') || 'Past records'}</h2>
            <p className="user-dashboard-card-sub">{t('user_past_records_sub') || 'View your consultation history and prescriptions.'}</p>
            <Link to="/user-history" className="user-dashboard-btn user-dashboard-btn-secondary">
              {t('user_view_history') || 'View my history'} →
            </Link>
          </div>

          <div className="user-dashboard-card user-dashboard-card-reminders">
            <div className="user-dashboard-card-icon">
              <span className="material-icons">medication</span>
            </div>
            <h2>{t('user_reminders_title') || 'Medicine reminders'}</h2>
            <p className="user-dashboard-card-sub">{t('user_reminders_sub') || 'Take your prescribed medicines as directed.'}</p>
            {remindersLoading ? (
              <p className="user-dashboard-reminders-loading">{t('loading') || 'Loading…'}</p>
            ) : reminders.length === 0 ? (
              <p className="user-dashboard-reminders-empty">{t('user_no_reminders') || 'No active prescriptions right now.'}</p>
            ) : (
              <ul className="user-dashboard-reminders-list">
                {reminders.map((r, i) => (
                  <li key={i} className="user-dashboard-reminder-item">
                    <span className="material-icons user-dashboard-reminder-dot">notifications_active</span>
                    <div>
                      <strong>{r.medicine_name}</strong>
                      <span className="user-dashboard-reminder-timing">{r.timing_frequency}</span>
                      {r.notes && <span className="user-dashboard-reminder-notes">{r.notes}</span>}
                      {r.prescribed_at && (
                        <span className="user-dashboard-reminder-date">{t('user_prescribed') || 'Prescribed'} {formatDate(r.prescribed_at)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
