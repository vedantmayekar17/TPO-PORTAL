import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./Index.jsx";
import StudentLogin from "./components/StudentLogin";
import StudentSignup from "./components/StudentSignup";

import StudentApplications from "./components/StudentDashboard/StudentApplications.jsx";
import StudentDrives from "./components/StudentDashboard/StudentDrives.jsx";
import StudentProfile from "./components/StudentDashboard/StudentProfile.jsx";
import StudentSidebar from "./components/StudentDashboard/StudentSidebar.jsx";

import AdminLogin from "./components/AdminLogin";
import AdminApplications from "./components/AdminDashboard/AdminApplications.jsx";
import AdminDrives from "./components/AdminDashboard/AdminDrives.jsx";
import AdminSidebar from "./components/AdminDashboard/AdminSidebar.jsx";
import AdminStats from "./components/AdminDashboard/AdminStats.jsx";
import AdminStudents from "./components/AdminDashboard/AdminStudents.jsx";

import EditProfile from "./components/EditProfile";
import About from "./components/About";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />

        {/* Student Dashboard sections */}
        <Route path="/student-dashboard/applications" element={<StudentApplications />} />
        <Route path="/student-dashboard/drives" element={<StudentDrives />} />
        <Route path="/student-dashboard/profile" element={<StudentProfile />} />
        <Route path="/student-dashboard/sidebar" element={<StudentSidebar />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        {/* Admin Dashboard sections */}
        <Route path="/admin-dashboard/applications" element={<AdminApplications />} />
        <Route path="/admin-dashboard/drives" element={<AdminDrives />} />
        <Route path="/admin-dashboard/sidebar" element={<AdminSidebar />} />
        <Route path="/admin-dashboard/stats" element={<AdminStats />} />
        <Route path="/admin-dashboard/students" element={<AdminStudents />} />

        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
