import React from "react";

const StudentDrives = ({ drives = [], applications = [], onApply, isAlreadyApplied, getApplicationStatus, getStatusClass }) => (
  <div className="drives-section">
    <div className="section-header">
      <h2>🏢 Available Placement Drives</h2>
      {/* Add a Refresh button or filters if needed */}
    </div>
    {drives.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No Placement Drives Available</h3>
        <p>Check back later for new opportunities!</p>
      </div>
    ) : (
      <div className="drives-grid">
        {drives.map((drive) => (
          <div key={drive._id} className="drive-card">
            <div className="drive-header">
              <h3>{drive.company}</h3>
              <span className={`drive-status ${drive.status === "Open" ? "status-open" : "status-closed"}`}>{drive.status}</span>
            </div>
            {/* ...fill in drive details, role, package, date, etc... */}
            <div className="drive-footer">
              {isAlreadyApplied(drive._id) ? (
                <button className={`btn-applied ${getStatusClass(getApplicationStatus(drive._id))}`} disabled>
                  {getApplicationStatus(drive._id)}
                </button>
              ) : drive.status === "Closed" ? (
                <button className="btn-closed" disabled>
                  🔒 Registration Closed
                </button>
              ) : (
                <button className="btn-apply" onClick={() => onApply(drive._id)}>
                  ✅ Apply Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default StudentDrives;
