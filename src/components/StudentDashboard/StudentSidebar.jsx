import React from "react";

const StudentSidebar = ({ activeTab, setActiveTab }) => (
  <div className="student-sidebar">
    <div
      className={activeTab === "profile" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setActiveTab("profile")}
    >
      Profile
    </div>
    <div
      className={activeTab === "drives" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setActiveTab("drives")}
    >
      Drives
    </div>
    <div
      className={activeTab === "applications" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setActiveTab("applications")}
    >
      Applications
    </div>
    <div
      className="sidebar-item logout"
      onClick={() => setActiveTab("logout")}
    >
      Logout
    </div>
  </div>
);

export default StudentSidebar;
