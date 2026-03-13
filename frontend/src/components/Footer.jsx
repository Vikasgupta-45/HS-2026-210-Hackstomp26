import { Link } from 'react-router-dom'
import LogoIcon from './LogoIcon'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <LogoIcon size={36} color="currentColor" />
            <span>AROGYA</span>
          </div>
          <p>Bridging healthcare to every village in India through technology, compassion, and community.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">IG</a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h5>Platform</h5>
            <Link to="/asha-login">ASHA Portal</Link>
            <Link to="/doctor-dashboard">Doctor Dashboard</Link>
            <a href="#">Health Records</a>
            <a href="#">Telemedicine</a>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <a href="#">About Us</a>
            <a href="#">Our Mission</a>
            <a href="#">Press & Media</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <a href="#">Help Center</a>
            <a href="#">Training Videos</a>
            <a href="#">Contact Us</a>
            <a href="#">Data Privacy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Arogya Health Technologies Pvt. Ltd. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">ABDM Compliant</a>
        </div>
      </div>
    </footer>
  )
}
