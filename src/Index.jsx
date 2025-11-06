import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

function Index() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-brand">
            <img 
              src="https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/15e83767-762a-55ff-b573-9677ee192d09/01a84265-e09c-5682-92ce-681c89a1afe2.jpg" 
              alt="APSIT Logo" 
              className="nav-logo"
            />
            <div className="nav-brand-text">
              <h2>APSIT Placement Portal</h2>
              <p>AIML Department</p>
            </div>
          </div>
          <div className="nav-links">
            <Link to="/about" className="nav-link">📖 About</Link>
            <Link to="/student-login" className="nav-btn">Student Login</Link>
            <Link to="/admin-login" className="nav-btn nav-btn-primary">Admin Login</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🎓</span>
            <span>Placement Season 2025</span>
            <span className="badge-pulse"></span>
          </div>
          <h1 className="hero-title">
            Building Careers,<br />
            <span className="gradient">Shaping Futures</span>
          </h1>
          <p className="hero-text">
            A. P. Shah Institute of Technology - Where Excellence Meets Opportunity
          </p>
          <div className="hero-buttons">
            <Link to="/student-login" className="btn-primary">
              Apply for Placements 
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/about" className="btn-secondary">
              <span className="btn-icon">ℹ️</span>
              Learn More
            </Link>
          </div>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Top Companies</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>High Packages</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>100% Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div className="stat-item stat-item-1">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">🏢</div>
          </div>
          <h3 className="stat-number" data-target="120">120+</h3>
          <p>Partner Companies</p>
          <div className="stat-bar"></div>
        </div>
        <div className="stat-item stat-item-2">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">🎯</div>
          </div>
          <h3 className="stat-number" data-target="200">200+</h3>
          <p>Students Placed</p>
          <div className="stat-bar"></div>
        </div>
        <div className="stat-item stat-item-3">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">💰</div>
          </div>
          <h3 className="stat-number">₹15 LPA</h3>
          <p>Highest Package</p>
          <div className="stat-bar"></div>
        </div>
        <div className="stat-item stat-item-4">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">📈</div>
          </div>
          <h3 className="stat-number">₹7 LPA</h3>
          <p>Average Package</p>
          <div className="stat-bar"></div>
        </div>
      </section>

      {/* DRIVES SECTION */}
      <section className="drives">
        <div className="drives-header">
          <h2 className="section-title">Upcoming Placement Drives</h2>
          <p className="section-subtitle">Register early to secure your spot</p>
        </div>
        
        <div className="drives-grid">
          <div className="drive-card featured">
            <div className="drive-badge-wrapper">
              <div className="drive-badge hot">
                <span>🔥</span> Hot
              </div>
            </div>
            <div className="company-logo">
              <div className="company-name">TCS</div>
            </div>
            <h3 className="drive-title">Software Engineer - Digital</h3>
            <div className="drive-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span>12 November 2025</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💼</span>
                <span className="info-highlight">₹6.0 LPA</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <span>Pan India</span>
              </div>
            </div>
            <Link to="/student-login" className="apply-btn">
              Apply Now <span className="apply-arrow">→</span>
            </Link>
          </div>

          <div className="drive-card">
            <div className="drive-badge-wrapper">
              <div className="drive-badge new">
                <span>✨</span> New
              </div>
            </div>
            <div className="company-logo">
              <div className="company-name">Infosys</div>
            </div>
            <h3 className="drive-title">System Engineer</h3>
            <div className="drive-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span>18 November 2025</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💼</span>
                <span className="info-highlight">₹5.0 LPA</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <span>Pune, Mumbai</span>
              </div>
            </div>
            <Link to="/student-login" className="apply-btn">
              Apply Now <span className="apply-arrow">→</span>
            </Link>
          </div>

          <div className="drive-card">
            <div className="drive-badge-wrapper">
              <div className="drive-badge">
                <span>✅</span> Open
              </div>
            </div>
            <div className="company-logo">
              <div className="company-name">Capgemini</div>
            </div>
            <h3 className="drive-title">Analyst Programmer</h3>
            <div className="drive-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span>25 November 2025</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💼</span>
                <span className="info-highlight">₹4.2 LPA</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <span>Mumbai</span>
              </div>
            </div>
            <Link to="/student-login" className="apply-btn">
              Apply Now <span className="apply-arrow">→</span>
            </Link>
          </div>

          <div className="drive-card">
            <div className="drive-badge-wrapper">
              <div className="drive-badge">
                <span>✅</span> Open
              </div>
            </div>
            <div className="company-logo">
              <div className="company-name">Persistent</div>
            </div>
            <h3 className="drive-title">Software Developer</h3>
            <div className="drive-info">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <span>28 November 2025</span>
              </div>
              <div className="info-item">
                <span className="info-icon">💼</span>
                <span className="info-highlight">₹8.5 LPA</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📍</span>
                <span>Pune</span>
              </div>
            </div>
            <Link to="/student-login" className="apply-btn">
              Apply Now <span className="apply-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="drives-footer">
          <Link to="/student-login" className="view-all-btn">
            View All Drives <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials">
        <h2 className="section-title">Success Stories</h2>
        <p className="section-subtitle">Hear from our placed students</p>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              The placement cell provided excellent guidance throughout the interview process. Got placed at TCS with amazing support!
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">RS</div>
              <div className="author-info">
                <h4>Raj Shah</h4>
                <p>TCS • ₹6 LPA</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              Amazing platform! The TPO team helped me prepare for technical rounds and I secured my dream job at Persistent.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">PP</div>
              <div className="author-info">
                <h4>Priya Patel</h4>
                <p>Persistent • ₹8.5 LPA</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">
              Great opportunities and excellent support system. The portal made application process very easy and streamlined.
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">AK</div>
              <div className="author-info">
                <h4>Amit Kumar</h4>
                <p>Infosys • ₹5 LPA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>APSIT Placement Portal</h3>
            <p>Empowering students to achieve their career goals</p>
            <div className="footer-social">
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/student-login">Student Portal</Link></li>
              <li><Link to="/admin-login">Admin Portal</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>📧 tnp@apsit.edu.in</li>
              <li>📞 +91 022 1234 5678</li>
              <li>📍 Thane, Maharashtra</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 A.P. Shah Institute of Technology - Training & Placement Cell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Index;
