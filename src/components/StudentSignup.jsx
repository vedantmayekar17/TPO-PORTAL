import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentSignup.css";

function StudentSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roll: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Signup Successful! Please login.");
        navigate("/student-login");
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("❌ Backend not responding! Make sure server is running.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>📝 Student Signup</h1>
        <p>Register to access your student dashboard</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="roll"
            placeholder="Roll Number"
            value={formData.roll}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <a href="/student-login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default StudentSignup;
