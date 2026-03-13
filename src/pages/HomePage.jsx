import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

/* ── Reusable reveal wrapper ── */
function Reveal({ children, className = '', delay = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal-up ${delay} ${className}`}>
      {children}
    </div>
  )
}

/* ── Counter animation ── */
function Counter({ target, unit }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.unobserve(el)
        let start = 0
        const step = Math.ceil(target / 60)
        const timer = setInterval(() => {
          start = Math.min(start + step, target)
          setVal(start)
          if (start >= target) clearInterval(timer)
        }, 25)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val.toLocaleString()}{unit}</span>
}

const TICKER_ITEMS = [
  'ASHA Workers','Telemedicine','Rural Healthcare','AI Diagnostics',
  'Digital Health Records','Maternal Health','Village Clinics',
  'ASHA Workers','Telemedicine','Rural Healthcare','AI Diagnostics',
  'Digital Health Records','Maternal Health','Village Clinics',
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <div className="hero-bg-grid" />
          <div className="hero-content">
            <Reveal className="hero-badge">🌿 Powered by Community Health</Reveal>
            <Reveal delay="delay-1">
              <h1 className="hero-heading">
                HEALTHCARE <span className="highlight-pill">FOR EVERY</span><br />VILLAGE IN INDIA
              </h1>
            </Reveal>
            <Reveal delay="delay-2">
              <p className="hero-sub">
                Arogya bridges the gap between rural communities and quality medical care — through ASHA workers, telemedicine, and AI-powered diagnostics.
              </p>
            </Reveal>
            <Reveal delay="delay-3">
              <div className="hero-cta">
                <Link to="/asha-login" className="btn btn-primary">Join as ASHA Worker</Link>
                <Link to="/doctor-dashboard" className="btn btn-outline">Doctor Dashboard →</Link>
              </div>
            </Reveal>
            <Reveal delay="delay-4">
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-num"><Counter target={12000} unit="+" /></span>
                  <p>ASHA Workers</p>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-num"><Counter target={850} unit="+" /></span>
                  <p>Villages Covered</p>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-num"><Counter target={95} unit="%" /></span>
                  <p>Patient Satisfaction</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero visual */}
          <div className="hero-visual">
            <div className="hero-card-float hero-card-1">
              <span className="material-icons">monitor_heart</span>
              <div><strong>Live Vitals</strong><small>Real-time monitoring</small></div>
            </div>
            <div className="hero-circle-main">
              <div className="hero-circle-inner">
                <span className="material-icons hero-icon-main">health_and_safety</span>
              </div>
              <div className="orbit orbit-1"><div className="orbit-dot" /></div>
              <div className="orbit orbit-2"><div className="orbit-dot" /></div>
              <div className="orbit orbit-3"><div className="orbit-dot" /></div>
            </div>
            <div className="hero-card-float hero-card-2">
              <span className="material-icons">video_call</span>
              <div><strong>Telemedicine</strong><small>Connect with doctors</small></div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {TICKER_ITEMS.map((item, i) => (
              <span key={i}>{item}{i % 2 === 1 && <span className="ticker-dot"> ✦ </span>}</span>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">Process</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">HOW AROGYA <span className="text-sage">WORKS</span></h2></Reveal>
              <Reveal delay="delay-2"><p className="section-sub">A seamless, four-step system that puts health in everyone's hands.</p></Reveal>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', icon:'person_pin',      title:'ASHA Worker Registers',   body:'Community health workers sign up on Arogya, complete training modules, and get assigned to their catchment area of up to 1,000 people.' },
                { n:'02', icon:'biotech',          title:'Capture Vitals & Data',   body:'Using affordable IoT devices, ASHA workers capture blood pressure, oxygen levels, temperature, and weight — synced to patient records.' },
                { n:'03', icon:'video_call',       title:'Connect with Doctor',     body:'Patients get live video consultations with licensed doctors. AI flags high-risk cases immediately for priority attention, 24/7.' },
                { n:'04', icon:'medical_services', title:'Provide Treatment',       body:'Digital prescriptions go directly to Jan Aushadhi pharmacies or ASHA medicine kits. Follow-up and recovery are automated.' },
              ].map((s, i) => (
                <Reveal key={i} delay={`delay-${i+1}`}>
                  <div className="step-card">
                    <div className="step-num">{s.n}</div>
                    <div className="step-icon"><span className="material-icons">{s.icon}</span></div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="section-alt" id="features">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">What We Offer</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">BUILT FOR <span className="text-sage">BHARAT</span></h2></Reveal>
            </div>
            <div className="features-bento">
              {[
                { size:'bento-large',  icon:'smart_toy',       title:'AI-Powered Symptom Screening',   body:'Our multilingual AI assistant screens symptoms in Hindi, Tamil, Telugu, and 8 other languages — making healthcare truly accessible.', tag:'Smart Diagnosis' },
                { size:'bento-medium', icon:'folder_shared',   title:'Unified Health Records',         body:'Every patient\'s complete history, prescriptions, and lab reports in one secure, offline-capable digital profile.', tag:'Data Security' },
                { size:'bento-medium', icon:'pregnant_woman',  title:'Maternal & Child Care',          body:'Dedicated pregnancy tracking, vaccination schedules, and newborn care checklists aligned with national health programs.', tag:'RMNCH+A' },
                { size:'bento-small',  icon:'local_pharmacy',  title:'Medicine Delivery',              body:'Link to Jan Aushadhi stores for affordable generic medicines with doorstep delivery in 48 hours.', tag:'Last Mile' },
                { size:'bento-small',  icon:'bar_chart',       title:'Health Analytics',               body:'District-level dashboards for officials to track disease patterns and allocate resources proactively.', tag:'Policy Ready' },
                { size:'bento-small',  icon:'wifi_off',        title:'Works Offline',                  body:'Core features work without internet — data syncs when connectivity returns. Built for rural India\'s reality.', tag:'Offline-First' },
              ].map((f, i) => (
                <Reveal key={i} delay={`delay-${(i%3)+1}`} className={f.size}>
                  <div className="bento-card" style={{ height: '100%' }}>
                    <div className="bento-icon"><span className="material-icons">{f.icon}</span></div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    <div className="bento-tag">{f.tag}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="mission-section" id="mission">
          <div className="container">
            <div className="mission-layout">
              <div className="reveal-left mission-text" ref={useRevealRef()}>
                <span className="section-label">Our Mission</span>
                <h2 className="section-title">NO VILLAGE <span className="highlight-block">LEFT BEHIND</span></h2>
                <p>India has 640,000 villages. Only 25% have access to primary healthcare within 5 km. Arogya changes that — one ASHA worker, one patient, one village at a time.</p>
                <p>We believe healthcare is a fundamental right. Our platform is free for patients, subsidized for rural practitioners, and co-funded with government health missions.</p>
                <a href="#" className="btn btn-primary" style={{ marginTop: '24px' }}>Read Our Story →</a>
              </div>
              <div className="mission-cards">
                {[
                  { icon:'favorite', num:'150,000+', label:'Patients served annually across 18 Indian states', accent:false },
                  { icon:'groups',   num:'12,000+',  label:'ASHA workers empowered with digital tools', accent:true },
                  { icon:'science',  num:'97%',      label:'Diagnostic accuracy on our AI screening model', accent:false },
                ].map((m, i) => (
                  <div key={i} className={`mcard${m.accent ? ' mcard-accent' : ''}`}>
                    <span className="material-icons mcard-icon">{m.icon}</span>
                    <div>
                      <h4>{m.num}</h4>
                      <p>{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="section" id="testimonials">
          <div className="container">
            <div className="section-header">
              <Reveal><span className="section-label">Stories</span></Reveal>
              <Reveal delay="delay-1"><h2 className="section-title">VOICES FROM <span className="text-sage">THE FIELD</span></h2></Reveal>
            </div>
            <div className="testimonials-grid">
              {[
                { quote: 'Before Arogya, pregnant women had to travel 40 km to see a doctor. Now I monitor their vitals every week and connect them with specialists on my phone.', name:'Sunita Sharma', role:'ASHA Worker, Rajasthan', init:'SS' },
                { quote: 'The platform flagged my patient\'s pre-eclampsia at 28 weeks. She was referred to the district hospital immediately. Both mother and baby are healthy today.', name:'Dr. Rekha Pillai', role:'Obstetrician, Tamil Nadu', init:'DR' },
                { quote: 'As a state health officer, the analytics dashboard helps us see disease outbreaks forming before they spread. Arogya transformed how we plan health responses.', name:'Anil Kumar', role:'District Health Officer, UP', init:'AK' },
              ].map((t, i) => (
                <Reveal key={i} delay={`delay-${i+1}`}>
                  <div className="tcard">
                    <div className="tcard-quote">"</div>
                    <p>{t.quote}</p>
                    <div className="tcard-author">
                      <div className="tcard-avatar">{t.init}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <small>{t.role}</small>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <Reveal>
            <div className="cta-content">
              <h2>READY TO TRANSFORM<br /><span className="cta-highlight">RURAL HEALTHCARE?</span></h2>
              <p>Join 12,000+ ASHA workers already using Arogya to save lives every day.</p>
              <div className="cta-actions">
                <Link to="/asha-login"       className="btn btn-white">Get Started Free</Link>
                <Link to="/doctor-dashboard" className="btn btn-outline-white">Doctor Portal →</Link>
              </div>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}

/* tiny helper to avoid importing the hook (mission section needs imperative ref) */
function useRevealRef() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } },
      { threshold: 0.12 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return ref
}
