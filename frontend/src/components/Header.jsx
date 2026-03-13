import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import LogoIcon from './LogoIcon'

export default function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      {/* Desktop nav */}
      <nav className="nav-container">
        <div className="nav-left">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <a href="/#how-it-works" className="nav-link">How It Works</a>
          <a href="/#features" className="nav-link">Features</a>
        </div>

        <Link to="/" className="logo-wrap">
          <div className="logo-icon">
            <LogoIcon />
          </div>
          <span className="logo-text">AROGYA</span>
        </Link>

        <div className="nav-right">
          <a href="/#mission" className="nav-link">Mission</a>
          <NavLink to="/asha-login" className="nav-link">ASHA Portal</NavLink>
          <NavLink to="/doctor-login" className="nav-btn">Doctor Login</NavLink>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="nav-mobile">
        <button
          className="burger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="logo-wrap-mobile">AROGYA</Link>
      </div>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/">Home</Link>
        <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="/#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/#mission" onClick={() => setMenuOpen(false)}>Mission</a>
        <Link to="/asha-login">ASHA Portal</Link>
        <Link to="/doctor-login">Doctor Login</Link>
      </div>
    </header>
  )
}
