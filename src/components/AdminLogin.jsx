import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
const token = localStorage.getItem('adminToken');
const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await fetch("http://localhost:5000/api/adminLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    // After successful login
if (data.success) {
  localStorage.setItem('adminData', JSON.stringify(data.admin));
  localStorage.setItem('adminToken', data.token); // <-- Save the ACTUAL JWT token here
  alert('✅ Login Successful');
  navigate('/admin-dashboard');
} else {
  setError(data.message || 'Invalid username or password');
}

    
  } catch (err) {
    console.error("Login error:", err);
    setError("⚠️ Server not responding! Make sure backend is running.");
  }
};

  return (
    <div className="login-body">
      <div className="login-box">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRegXAqWEmTGGi1K2wOi0JmmU0Xh_PGL3kFxg&s"
          className="logo"
          alt="logo"
        />

        <h2>TPO ADMIN LOGIN</h2>

        {error && <div className="errorBox">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Admin Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
