import React, { useState } from "react";

// AdminApplications component: displays application list with search and actions
const AdminApplications = ({ applications = [], onApprove, onReject, onDelete }) => {
  // Local state for search input
  const [searchTerm, setSearchTerm] = useState("");

  // Robustly filter even if fields are missing
  const filteredApps = applications.filter(app => {
    const student = app.studentName || "";
    const company = app.company || "";
    return (
      student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="admin-applications">
      {/* Search/filter input for applications */}
      <div className="application-filters" style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by Student or Company..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "8px", width: "320px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      {/* Applications Table */}
      <table className="applications-table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Student</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Company</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Status</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No applications found.</td>
            </tr>
          ) : (
            filteredApps.map(app => (
              <tr key={app._id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{app.studentName || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{app.company || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{app.status || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button
                    onClick={() => onApprove(app._id)}
                    style={{ padding: "6px 10px", marginRight: "6px", background: "#43a047", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >Approve</button>
                  <button
                    onClick={() => onReject(app._id)}
                    style={{ padding: "6px 10px", marginRight: "6px", background: "#e53935", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >Reject</button>
                  <button
                    onClick={() => onDelete(app._id)}
                    style={{ padding: "6px 10px", background: "#757575", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminApplications;
