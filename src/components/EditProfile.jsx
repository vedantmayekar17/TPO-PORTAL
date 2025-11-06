import React, { useEffect, useState } from "react";
import "./EditProfile.css"; // ✅ We'll create this next
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    branch: "",
    roll: ""
  });

  const [imagePreview, setImagePreview] = useState("/user.png");

  // ✅ Toggle Dark Mode
  const toggleDark = () => {
    setDark(!dark);
  };

  // ✅ Load Logged-in Student Data
  const loadProfile = async () => {
    const res = await fetch("http://localhost:5000/api/session");
    const user = await res.json();

    if (!user || !user.roll) return navigate("/login");

    setForm({
      name: user.name,
      email: user.email || "",
      branch: user.branch,
      roll: user.roll
    });
  };

  // ✅ Save Changes
  const saveChanges = async () => {
    await fetch("http://localhost:5000/api/updateProfile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("✅ Profile updated!");
  };

  useEffect(() => { loadProfile(); }, []);

  return (
    <div className={`profile-body ${dark ? "dark-mode" : ""}`}>
      <button className="toggle-dark" onClick={toggleDark}>
        🌙 Dark Mode
      </button>

      <div className="card">
        <h2>Edit Profile</h2>

        <img src={imagePreview} alt="preview" id="preview" />

        <label className="upload" htmlFor="fileInput">Upload Photo</label>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) =>
            setImagePreview(URL.createObjectURL(e.target.files[0]))
          }
        />

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({...form, name:e.target.value})}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({...form, email:e.target.value})}
        />

        <input
          type="text"
          placeholder="Branch"
          value={form.branch}
          onChange={(e) => setForm({...form, branch:e.target.value})}
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={form.roll}
          onChange={(e) => setForm({...form, roll:e.target.value})}
        />

        <button onClick={saveChanges}>💾 Save Changes</button>

        <a className="back" onClick={() => navigate("/student-dashboard")}>
          ⬅ Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default EditProfile;
