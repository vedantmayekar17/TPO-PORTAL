import React from "react";

const AdminSidebar = ({ setPage, page }) => (
  <div className="admin-sidebar">
    <div 
      className={page === "dashboard" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setPage("dashboard")}
    >
      Dashboard
    </div>
    <div 
      className={page === "students" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setPage("students")}
    >
      Students
    </div>
    <div 
      className={page === "applications" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setPage("applications")}
    >
      Applications
    </div>
    <div 
      className={page === "drives" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setPage("drives")}
    >
      Drives
    </div>
    <div 
      className={page === "analytics" ? "sidebar-item active" : "sidebar-item"}
      onClick={() => setPage("analytics")}
    >
      Analytics
    </div>
    <div 
      className="sidebar-item logout"
      onClick={() => setPage("logout")}
    >
      Logout
    </div>
  </div>
);

export default AdminSidebar;
