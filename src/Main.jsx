
// npm install multer csvtojson mongoose recharts bcryptjs react-router-dom express dotenv cors axios
// npm install -D nodemon
// Properly formatted Index component
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

// 🔥 FIXED ENV VARIABLE (CRA compatible)
const API = process.env.REACT_APP_API_URL;

function Index() {
  const [scrolled, setScrolled] = useState(false);

  // 🔔 Notification States
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // 🔔 Fetch Notifications (Dynamic)
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const fetchNotifications = async () => {
  try {
    const res = await fetch(`${API}/api/notifications`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    setNotifications([]);
  } finally {
    setLoadingNotifs(false);
  }
};



  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [drives, setDrives] = useState([]);
const [loadingDrives, setLoadingDrives] = useState(true);

useEffect(() => {
  const fetchDrives = async () => {
    try {
      const res = await fetch(`${API}/api/drives`);
      if (!res.ok) throw new Error("Failed to fetch drives");
      const data = await res.json();
      setDrives(data.drives || []);
    } catch (err) {
      console.error("Fetch Drives Error:", err);
      setDrives([]);
    } finally {
      setLoadingDrives(false);
    }
  };
  fetchDrives();
}, []);

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
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
            Building Careers,
            <br />
            <span className="gradient">Shaping Futures</span>
          </h1>

          <p className="hero-text">
            A. P. Shah Institute of Technology - Where Excellence Meets Opportunity
          </p>

          <div className="hero-buttons">
            <Link to="/student-login" className="btn-primary">
              Apply for Placements <span className="btn-arrow">→</span>
            </Link>
            <Link to="/about" className="btn-secondary">
              <span className="btn-icon">ℹ️</span> Learn More
            </Link>
          </div>

          <div className="hero-features">
            <div className="feature-item"><span className="feature-icon">✓</span>Top Companies</div>
            <div className="feature-item"><span className="feature-icon">✓</span>High Packages</div>
            <div className="feature-item"><span className="feature-icon">✓</span>100% Support</div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats">
        <div className="stat-item stat-item-1">
          <div className="stat-icon-wrapper"><div className="stat-icon">🏢</div></div>
          <h3 className="stat-number">120+</h3><p>Partner Companies</p><div className="stat-bar"></div>
        </div>

        <div className="stat-item stat-item-2">
          <div className="stat-icon-wrapper"><div className="stat-icon">🎯</div></div>
          <h3 className="stat-number">200+</h3><p>Students Placed</p><div className="stat-bar"></div>
        </div>

        <div className="stat-item stat-item-3">
          <div className="stat-icon-wrapper"><div className="stat-icon">💰</div></div>
          <h3 className="stat-number">₹15 LPA</h3><p>Highest Package</p><div className="stat-bar"></div>
        </div>

        <div className="stat-item stat-item-4">
          <div className="stat-icon-wrapper"><div className="stat-icon">📈</div></div>
          <h3 className="stat-number">₹7 LPA</h3><p>Average Package</p><div className="stat-bar"></div>
        </div>
      </section>

      {/* 🔔 NOTIFICATIONS SECTION (DYNAMIC) */}
      <section className="notifications">
        <h2 className="section-title">Latest Notifications</h2>

        {loadingNotifs ? (
          <p className="notif-loading">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="notif-empty">No notifications available</p>
        ) : (
          <ul className="notification-list">
            {notifications.slice(0, 5).map((n, i) => (
              <li key={i} className="notification-item">
                <span className="notification-icon">📢</span>
                <div className="notification-content">
                  <p className="notification-message">{n.message}</p>
                  <p className="notification-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link to="/notifications" className="notifications-viewall">
          View All →
        </Link>
      </section>

     {/* DRIVES SECTION (Dynamic from DB) */}
{/* DRIVES (Dynamic from DB) */}
<section className="drives">
  <div className="drives-header">
    <h2 className="section-title">Upcoming Placement Drives</h2>
    <p className="section-subtitle">Register early to secure your spot</p>
  </div>

  <div className="drives-grid">
    {loadingDrives ? (
      <p>Loading drives...</p>
    ) : drives.length === 0 ? (
      <p>No upcoming drives</p>
    ) : (
      drives.map((drive) => (
        <div key={drive._id} className="drive-card">
          <h3 className="drive-title">{drive.company} - {drive.role}</h3>
          <p className="drive-date">📅 Drive Date: {new Date(drive.driveDate).toLocaleDateString()}</p>
          <p className="drive-deadline">⏰ Apply By: {new Date(drive.deadline).toLocaleDateString()}</p>
          <p className="drive-ctc">💰 CTC: {drive.ctc}</p>
          <p className="drive-location">📍 Location: {drive.location || "APSIT Campus"}</p>
          <p className="drive-eligibility">
            🎓 Eligible Branches: {drive.eligibleBranches.join(", ")}
          </p>
          <p className="drive-cgpa">📈 Minimum CGPA: {drive.minCgpa}</p>
          <a href="/student-login" className="btn-primary drive-apply">
            Apply Now
          </a>
        </div>
      ))
    )}
  </div>

  {/* <div className="drives-footer">
    <a href="/student-login" className="view-all-btn">
      View All Drives <span className="arrow">→</span>
    </a>
  </div>
</section> */}


  <div className="drives-footer">
    <a href="/student-login" className="view-all-btn">
      View All Drives <span className="arrow">→</span>
    </a>
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
