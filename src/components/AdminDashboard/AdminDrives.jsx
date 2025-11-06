import React, { useState } from "react";

// AdminDrives: Displays drives with search/filter and Add/Edit/Delete actions
const AdminDrives = ({ drives = [], onAddDrive, onEditDrive, onDeleteDrive }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter by company or position name (case-insensitive)
  const filteredDrives = drives.filter(drive =>
    (drive.company && drive.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (drive.position && drive.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-drives">
      {/* Search/filter and Add button */}
      <div className="drive-filters" style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by Company or Position..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "8px", width: "320px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          onClick={onAddDrive}
          style={{ marginLeft: "12px", padding: "8px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          + Add Drive
        </button>
      </div>
      {/* Drives Table */}
      <table className="drives-table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Company</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Position</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Date</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrives.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>No drives found.</td>
            </tr>
          ) : (
            filteredDrives.map(drive => (
              <tr key={drive._id || drive.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{drive.company || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{drive.position || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{drive.date ? new Date(drive.date).toLocaleDateString() : "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button
                    onClick={() => onEditDrive(drive)}
                    style={{ padding: "6px 12px", marginRight: "8px", background: "#43a047", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >Edit</button>
                  <button
                    onClick={() => onDeleteDrive(drive._id || drive.id)}
                    style={{ padding: "6px 12px", background: "#e53935", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
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

export default AdminDrives;
