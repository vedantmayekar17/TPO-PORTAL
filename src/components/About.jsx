import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      {/* NAVBAR */}
      <nav className="about-nav">
        <div className="nav-brand">
          <h2>APSIT Placement Portal</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/student-login">Login</Link>
          <Link to="/student-dashboard">Dashboard</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="about-hero">
        <h1>About This Project</h1>
        <p>Supporting the AIML Department with a modern placement system</p>
      </div>

      {/* CONTENT SECTION */}
      <div className="about-content">
        <div className="about-card">
          <h2>📌 Project Overview</h2>
          <p>
            The <strong>APSIT Placement Portal</strong> is designed for the <strong>AIML Department</strong> to 
            simplify placement data management and improve record tracking.
          </p>
        </div>

        <div className="about-card">
          <h2>✅ Key Features</h2>
          <ul>
            <li>Students can submit company details and track placement status</li>
            <li>Admin/Faculty can monitor department-wide placement progress</li>
            <li>Real-time dashboard for placement statistics</li>
            <li>Secure login system for students and administrators</li>
          </ul>
        </div>

        <div className="about-card">
          <h2>🛠️ Technologies Used</h2>
          <ul>
            <li>Frontend: React.js, React Router</li>
            <li>Styling: CSS3 with responsive design</li>
            <li>Backend: Node.js, Express (API integration ready)</li>
            <li>Database: MongoDB/MySQL compatible</li>
          </ul>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="about-footer">
        <p>© 2025 APSIT Placement Portal | Developed by <strong>Vedant Mayekar</strong></p>
      </footer>
    </div>
  );
}

export default About;
