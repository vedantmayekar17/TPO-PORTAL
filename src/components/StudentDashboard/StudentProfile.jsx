import React from "react";

const StudentProfile = ({
  student,
  isEditing,
  editForm,
  setEditForm,
  onEdit,
  onSave,
  onCancel,
  error
}) => (
  <div className="profile-section">
    {/* Section Header */}
    <div className="section-header">
      <h2>📝 My Profile</h2>
      {!isEditing && (
        <button className="btn-edit" onClick={onEdit}>✏️ Edit Profile</button>
      )}
    </div>
    {error && <div className="error-message">{error}</div>}

    {/* Edit Mode */}
    {isEditing ? (
      <form className="profile-form" onSubmit={onSave}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={editForm.email}
            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
        </div>
        {/* Add other fields (phone, branch, year, cgpa, skills, bio) as you need */}
        <button type="submit" className="btn-save">💾 Save Changes</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>❌ Cancel</button>
      </form>
    ) : (
      /* View Mode */
      <div className="profile-view">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {student && student.name ? student.name.charAt(0).toUpperCase() : "S"}
          </div>
          <h2>{student?.name}</h2>
          <p className="profile-email">{student?.email}</p>
        </div>
        <div className="profile-details">
          {/* Display other details similarly */}
        </div>
      </div>
    )}
  </div>
);

export default StudentProfile;
