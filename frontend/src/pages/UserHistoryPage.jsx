import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from '../components/LogoIcon'

const API = 'http://127.0.0.1:8000'

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

export default function UserHistoryPage() {
  const { t } = useLanguage()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const printRef = useRef(null)
  const navigate = useNavigate()
  const aadhaar = localStorage.getItem('user_aadhaar')

  useEffect(() => {
    if (!aadhaar) {
      navigate('/user-login')
      return
    }
    fetch(`${API}/user-detail/${aadhaar}`)
      .then((r) => {
        if (!r.ok) throw new Error('Record not found')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [aadhaar, navigate])

  const handleDownloadPDF = () => {
    const el = printRef.current
    if (!el) return
    const prevTitle = document.title
    document.title = `Health History - ${data?.full_name || aadhaar}`
    const printContent = el.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html><head><title>${document.title}</title>
      <style>
        body{ font-family: system-ui,sans-serif; padding: 24px; max-width: 700px; margin: 0 auto; }
        h1{ font-size: 1.25rem; margin-bottom: 4px; }
        .meta{ color: #666; font-size: 0.9rem; margin-bottom: 20px; }
        .summary{ background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; }
        .visit{ border: 1px solid #eee; border-radius: 8px; padding: 14px; margin-bottom: 12px; }
        .visit h3{ font-size: 0.95rem; margin: 0 0 8px 0; }
        .symptoms{ font-size: 0.9rem; color: #333; margin-bottom: 8px; }
        .meds{ font-size: 0.85rem; color: #444; }
        ul{ margin: 4px 0 0 16px; padding: 0; }
      </style></head><body>${printContent}</body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
      document.title = prevTitle
    }, 250)
  }

  if (loading) {
    return (
      <div className="user-history-wrap">
        <p className="user-history-loading">{t('loading') || 'Loading…'}</p>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="user-history-wrap">
        <p className="user-history-error">{error || 'No data'}</p>
        <Link to="/user-login" className="btn btn-outline">{t('user_login_title') || 'User Login'}</Link>
      </div>
    )
  }

  const meets = data.history?.length ?? 0
  const allSymptoms = (data.history || []).map((h) => h.symptoms_text).filter(Boolean).join('; ')
  const allMeds = (data.history || []).flatMap((h) => (h.prescribed_medicines || []).map((m) => m.medicine_name))

  return (
    <div className="user-history-wrap">
      <header className="user-history-header">
        <Link to="/" className="user-history-logo">
          <LogoIcon size={28} />
          <span>AROGYA</span>
        </Link>
        <Link to="/user-login" className="user-history-out" onClick={() => { localStorage.removeItem('user_token'); localStorage.removeItem('user_aadhaar'); localStorage.removeItem('user_name'); }}>
          {t('nav_logout') || 'Logout'}
        </Link>
      </header>

      <main className="user-history-main">
        <div className="user-history-actions no-print">
          {localStorage.getItem('user_token') && (
            <Link to="/user-dashboard" className="btn btn-outline">← {t('user_dashboard_back') || 'Dashboard'}</Link>
          )}
          <Link to="/" className="btn btn-outline">← {t('nav_home')}</Link>
          <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
            {t('user_history_download_pdf') || 'Download PDF'}
          </button>
        </div>

        <div ref={printRef} className="user-history-printable">
          <h1>{data.full_name || 'Patient'}</h1>
          <p className="user-history-meta">
            Aadhaar: {data.aadhaar} · {data.age ? `${data.age} yrs` : ''} · {data.gender || ''} · {data.contact_number || ''}
          </p>

          <div className="user-history-summary">
            <strong>{t('user_history_summary') || 'Summary'}</strong>
            <p>Doctor visits: <strong>{meets}</strong></p>
            {allSymptoms && <p>Symptoms: {allSymptoms.slice(0, 200)}{allSymptoms.length > 200 ? '…' : ''}</p>}
            {allMeds.length > 0 && (
              <p>Prescriptions: {[...new Set(allMeds)].slice(0, 15).join(', ')}{allMeds.length > 15 ? '…' : ''}</p>
            )}
          </div>

          <h2 className="user-history-h2">{t('user_history_visits') || 'Visit history'}</h2>
          {(data.history || []).map((h) => (
            <div key={h.consultation_id} className="user-history-visit">
              <h3>{formatDate(h.recorded_at)} · {h.case_status} · {h.ai_triage_level}</h3>
              {h.symptoms_text && <p className="user-history-symptoms">{h.symptoms_text}</p>}
              {h.doctor_diagnosis && <p><strong>Diagnosis:</strong> {h.doctor_diagnosis}</p>}
              {(h.prescribed_medicines || []).length > 0 && (
                <p className="user-history-meds">
                  <strong>Prescribed:</strong>
                  <ul>
                    {h.prescribed_medicines.map((m) => (
                      <li key={m.prescription_id}>{m.medicine_name} — {m.timing_frequency}, {m.duration_days} days</li>
                    ))}
                  </ul>
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
