import React, { useState } from "react";
import "./StudentLogin.css";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ roll: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Save student data to localStorage
        localStorage.setItem('studentData', JSON.stringify(data.student));
        localStorage.setItem('token', 'logged-in'); // Simple token
        
        alert("✅ Login Successful");
        navigate("/student-dashboard");
      } else {
        setError(data.message || "❌ Invalid roll or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("❌ Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎓 Student Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="roll"
            placeholder="Roll Number"
            value={form.roll}
            onChange={(e) => setForm({ ...form, roll: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>
          Don't have an account? <a href="/student-signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default StudentLogin;
