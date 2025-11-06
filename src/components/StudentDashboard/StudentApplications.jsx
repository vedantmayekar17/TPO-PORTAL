import React from "react";

const StudentApplications = ({ applications }) => (
  <div className="applications-section">
    <div className="section-header">
      <h2>📋 My Applications</h2>
      {/* Add refresh or filter buttons if needed */}
    </div>
    {applications.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h3>No Applications Yet</h3>
        <p>Apply to placement drives to see them here!</p>
      </div>
    ) : (
      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.companyName || "N/A"}</td>
                <td>{app.role || "N/A"}</td>
                <td>{app.appliedOn ? new Date(app.appliedOn).toLocaleDateString() : "-"}</td>
                <td><span className="status-badge">{app.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default StudentApplications;
