import React, { useState } from "react";

// AdminStudents: displays a table of student data with search/filter functionality and Edit/Delete actions
const AdminStudents = ({ students = [], onEdit, onDelete }) => {
  // Local state for search/filter input
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students by the search term (name or email)
  const filteredStudents = students.filter(student =>
    (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-students">
      {/* Search/filter input bar */}
      <div className="student-filters" style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>

      {/* Students Table */}
      <table className="students-table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Name</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Email</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Branch</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "24px" }}>No students found.</td>
            </tr>
          ) : (
            filteredStudents.map(student => (
              <tr key={student._id || student.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.name || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.email || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{student.branch || "-"}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button
                    onClick={() => onEdit(student)}
                    style={{ padding: "6px 12px", marginRight: "8px", background: "#1976d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(student._id || student.id)}
                    style={{ padding: "6px 12px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminStudents;
