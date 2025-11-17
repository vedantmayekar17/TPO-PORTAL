// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

// NOTE: Recharts imports are kept but unused — keep or remove based on whether you add charts.
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

/**
 * Fixed & cleaned AdminDashboard component
 *
 * Key fixes:
 * - Single authHeaders derived from token
 * - All fetch calls use ${API} base and check res.ok before res.json()
 * - Document upload/delete follow Option A:
 *     POST /api/students/:id/upload/:docType
 *     DELETE /api/students/:id/delete-doc/:docType/:index?
 * - changeApplicationStatus uses full API and reverts on failure
 * - Safe string coercions for .toLowerCase()
 * - exportCSV flattens primitive fields to avoid [object Object]
 * - Defensive checks & small UX improvements
 */

function AdminDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("dashboard");

  // Backend base URL
  const API = "http://localhost:5000";

  // Token + headers (single source)
  const token = localStorage.getItem("adminToken");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // Core data
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    editStudent: false,
    viewStudent: false,
    resetPass: false,
    editApp: false,
    createDrive: false,
    editDrive: false,
    viewDriveApplicants: false,
    uploadSheet: false,
    notifications: false,
    manageAdmins: false
  });

  // selected entities
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [driveApplicants, setDriveApplicants] = useState([]);

  // misc UI state
  const [newPassword, setNewPassword] = useState("");
  // separate search terms per page (prevents cross-filtering confusion)
  const [studentSearch, setStudentSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [driveSearch, setDriveSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    placedStudents: 0,
    avgCGPA: 0,
    branchWise: {},
    statusWise: {}
  });

  // drives / form
  const BRANCHES = ["AIML", "Comps", "IT", "AIDS", "ECE", "Mechanical", "Civil"];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const emptyDrive = {
    company: "",
    role: "",
    ctc: "",
    location: "",
    driveDate: "",
    deadline: "",
    minCgpa: "",
    eligibleBranches: [],
    description: ""
  };
  const [newDrive, setNewDrive] = useState(emptyDrive);

  

  // manage-admin modal state
  const [adminNewPassword, setAdminNewPassword] = useState("");

  // ------------------ API loaders ------------------
  const checkRes = async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return res.json().catch(() => ({}));
  };

  const loadStudents = async () => {
    try {
      const res = await fetch(`${API}/api/students`, { headers: authHeaders });
      const data = await checkRes(res);
      if (data.success) setStudents(data.students || []);
      else setStudents([]);
    } catch (err) {
      console.error("loadStudents:", err);
      setStudents([]);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await fetch(`${API}/api/applications`, { headers: authHeaders });
      const data = await checkRes(res);
      if (data.success) setApplications(data.applications || []);
      else setApplications([]);
    } catch (err) {
      console.error("loadApplications:", err);
      setApplications([]);
    }
  };

  const loadDrives = async () => {
    try {
      const res = await fetch(`${API}/api/drives`, { headers: authHeaders });
      const data = await checkRes(res);
      if (data.success) setDrives(data.drives || []);
      else setDrives([]);
    } catch (err) {
      console.error("loadDrives:", err);
      setDrives([]);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await fetch(`${API}/api/admins`, { headers: authHeaders });
      const data = await checkRes(res);
      if (data.success && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      } else {
        setAdmins([]);
        console.warn("⚠️ Unexpected admins response:", data);
      }
    } catch (err) {
      console.error("❌ Error loading admins:", err);
      alert("Failed to load admin data.");
      setAdmins([]);
    }
  };

  // Run on mount
  useEffect(() => {
    if (!token) return navigate("/admin-login");
    loadStudents();
    loadApplications();
    loadDrives();
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ Analytics ------------------
  useEffect(() => {
    const totalStudents = students.length;
    const totalApplications = applications.length;
    const placedStudents = applications.filter(a => a.status === "Placed").length;
    const avgCGPA =
      totalStudents > 0
        ? (students.reduce((sum, s) => sum + parseFloat(s.cgpa || 0), 0) / totalStudents).toFixed(2)
        : 0;

    const branchWise = students.reduce((acc, s) => {
      const branch = s.branch || "Unknown";
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {});

    const statusWise = applications.reduce((acc, a) => {
      const st = a.status || "Unknown";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    setStats({ totalStudents, totalApplications, placedStudents, avgCGPA, branchWise, statusWise });
  }, [students, applications]);

  // ------------------ Utility ------------------
  function normalizeYearLabel(year) {
    if (!year) return "";
    if (typeof year === "number") {
      const n = year;
      if (n === 1) return "1st Year";
      if (n === 2) return "2nd Year";
      if (n === 3) return "3rd Year";
      return `${n}th Year`;
    }
    const low = String(year).toLowerCase();
    if (low.includes("1")) return "1st Year";
    if (low.includes("2")) return "2nd Year";
    if (low.includes("3")) return "3rd Year";
    if (low.includes("4")) return "4th Year";
    return String(year);
  }

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin-login");
  };

  // exportCSV: flatten primitives (strings, numbers, booleans) only
  const exportCSV = (arr, filename) => {
    if (!arr || !arr.length) return alert("No data to export!");
    // Choose keys from first object but only include primitive values
    const first = arr[0];
    const keys = Object.keys(first).filter(k => !["_id", "__v", "password"].includes(k));
    const filteredKeys = keys.filter(k => {
      const v = first[k];
      return v === null || ["string", "number", "boolean"].includes(typeof v);
    });
    const csvRows = [
      filteredKeys.join(","),
      ...arr.map(obj =>
        filteredKeys
          .map(k => {
            const val = obj[k] === null || obj[k] === undefined ? "" : String(obj[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  // ------------------ Filters ------------------
  const filteredStudents = students.filter(s => {
    const q = String(studentSearch || "").toLowerCase();
    const match =
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.roll || "").toLowerCase().includes(q) ||
      String(s.email || "").toLowerCase().includes(q);
    const branchOk = filterBranch === "All" || s.branch === filterBranch;
    const yearOk = filterYear === "All" || normalizeYearLabel(s.year) === filterYear;
    return match && branchOk && yearOk;
  });

  const filteredApplications = applications.filter(a => {
    const q = String(appSearch || "").toLowerCase();
    const match =
      String(a.name || a.studentName || "").toLowerCase().includes(q) ||
      String(a.company || "").toLowerCase().includes(q);
    const statusOk = filterStatus === "All" || a.status === filterStatus;
    return match && statusOk;
  });

  const filteredDrives = drives.filter(d => {
    const q = String(driveSearch || "").toLowerCase();
    return (
      String(d.company || "").toLowerCase().includes(q) ||
      String(d.role || "").toLowerCase().includes(q)
    );
  });

  // ------------------ Modal helpers ------------------
  const openModal = (key, data = null) => {
    if (key === "viewStudent" || key === "editStudent" || key === "resetPass") setSelectedStudent(data);
    if (key === "editDrive") setNewDrive(data || emptyDrive);
    if (key === "viewDriveApplicants") setSelectedDrive(data);
    setModal(prev => ({ ...prev, [key]: true }));
    // Prevent background scroll while modal open
    document.body.style.overflow = "hidden";
  };

  const closeModal = (key) => {
    setModal(prev => ({ ...prev, [key]: false }));
    if (["viewStudent", "editStudent", "resetPass"].includes(key)) setSelectedStudent(null);
    if (key === "editDrive") setNewDrive(emptyDrive);
    if (key === "viewDriveApplicants") { setSelectedDrive(null); setDriveApplicants([]); }
    // Re-enable scroll if no modals open
    setTimeout(() => {
      const anyOpen = Object.values({ ...modal, [key]: false }).some(Boolean);
      if (!anyOpen) document.body.style.overflow = "";
    }, 0);
  };

  // ------------------ Student actions ------------------
  const deleteStudent = async id => {
    if (!window.confirm("Delete this student?")) return;
    try {
      const res = await fetch(`${API}/api/students/${id}`, { method: "DELETE", headers: authHeaders });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Student deleted");
        loadStudents();
        loadApplications();
      } else alert(data.message || "Failed to delete");
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Error deleting student");
    }
  };

  const resetPassword = async studentId => {
    if (!newPassword || newPassword.length < 6) return alert("Password must be at least 6 characters");
    try {
      const res = await fetch(`${API}/api/students/reset-password/${studentId}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ password: newPassword })
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Password reset");
        setNewPassword("");
        closeModal("resetPass");
      } else alert(data.message || "Failed");
    } catch (err) {
      console.error("resetPassword:", err);
      alert("Error");
    }
  };

  const updateStudent = async updated => {
    try {
      // If skills provided as string, convert to array (safe)
      if (typeof updated.skills === "string") {
        updated.skills = updated.skills.split(",").map(s => s.trim()).filter(Boolean);
      }

      const res = await fetch(`${API}/api/students/${updated._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(updated)
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Student updated");
        loadStudents();
        loadApplications();
        closeModal("editStudent");
      } else alert(data.message || "Failed");
    } catch (err) {
      console.error("updateStudent:", err);
      alert("Error updating");
    }
  };

  // ------------------ Drive / Application actions ------------------
  const adminApplyToDrive = async (studentId, driveId) => {
    if (!window.confirm("Apply student to this drive?")) return;
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          studentId,
          driveId,
          status: "Pending",
          appliedDate: new Date().toISOString(),
          appliedByAdmin: true
        })
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Student successfully applied!");
        await loadApplications();
        await loadDrives();
      } else {
        alert(data.error || data.message || "❌ Failed to apply");
      }
    } catch (err) {
      console.error("adminApplyToDrive:", err);
      alert("❌ Error applying student to drive.");
    }
  };

const viewDriveApplicants = async (drive) => {
  console.log("🔥 DRIVE RECEIVED:", drive);
  console.log("🔥 DRIVE ID:", drive?._id);
  console.log("🔥 CALLING:", `${API}/api/drives/${drive?.id}/applicants`);
  try {
  
    const res = await fetch(`${API}/api/drives/${drive._id}/applicants`, {
      headers: authHeaders
    });

    const data = await checkRes(res);

    setDriveApplicants(data.success ? data.applicants : []);
    openModal("viewDriveApplicants", drive);

  } catch (err) {
    console.error("viewDriveApplicants:", err);
    setDriveApplicants([]);
    openModal("viewDriveApplicants", drive);
  }
};


const saveDrive = async () => {
  try {
    if (!newDrive.company || !newDrive.role)
      return alert("Company and role required");

    const isEdit = Boolean(newDrive._id);

    const endpoint = isEdit
      ? `${API}/api/drives/${newDrive._id}`
      : `${API}/api/drives`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify(newDrive),
    });

    const data = await checkRes(res);

    if (data.success) {
      alert(`✅ Drive ${isEdit ? "updated" : "created"}`);
      loadDrives();
      setNewDrive(emptyDrive);
      closeModal(isEdit ? "editDrive" : "createDrive");
    } else {
      alert(data.message || "Failed");
    }
  } catch (err) {
    console.error("saveDrive:", err);
    alert("Error saving drive");
  }
};


  const deleteDrive = async (id) => {
    if (!window.confirm("Delete this drive?")) return;
    try {
      const res = await fetch(`${API}/api/drives/${id}`, {
        method: "DELETE",
        headers: authHeaders
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Drive deleted");
        loadDrives();
        loadApplications();
      } else alert(data.message || "Failed");
    } catch (err) {
      console.error("deleteDrive:", err);
      alert("Error deleting drive");
    }
  };

  // ------------------ New features ------------------
  const sendNotification = async (message, target = "all") => {
    if (!message) return alert("Enter message");
    try {
      const res = await fetch(`${API}/api/notifications`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ message, target })
      });
      const data = await checkRes(res);
      if (data.success) alert("✅ Notification sent");
      else alert(data.message || "Failed");
    } catch (err) {
      console.error("sendNotification:", err);
      alert("Failed to send notification");
    }
  };

  // ------------------ Feedback Management ------------------
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API}/api/feedbacks`, { headers: authHeaders });
      const data = await checkRes(res);
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      } else {
        console.error("Failed to fetch feedbacks:", data.message);
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Update feedback status or reply
  const updateFeedbackStatus = async (id, status, reply = "") => {
    try {
      const res = await fetch(`${API}/api/feedbacks/${id}`, {
        method: "PUT",
        headers: { ...authHeaders },
        body: JSON.stringify({ status, reply }),
      });
      const data = await checkRes(res);
      if (data.success) {
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === id ? data.feedback : f))
        );
      } else alert(data.message || "Failed to update feedback");
    } catch (err) {
      console.error("updateFeedbackStatus:", err);
      alert("Error updating feedback");
    }
  };

  // Auto-load feedbacks whenever modal opens
  useEffect(() => {
    if (modal.notifications) loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.notifications]);

  // ------------------ Document verification ------------------
  const verifyDocument = async (studentId, docType, status, comment = "") => {
    try {
      const res = await fetch(`${API}/api/students/${studentId}/verify/${docType}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ status, comment })
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Document verified");
        loadStudents();
      } else alert(data.message || "Failed");
    } catch (err) {
      console.error("verifyDocument:", err);
      alert("Error verifying");
    }
  };

  const sendReply = async (id, message) => {
  if (!message.trim()) return alert("Enter reply message");

  try {
    const res = await fetch(`${API}/api/feedbacks/${id}`, {
  method: "PUT",
  headers: authHeaders,
  body: JSON.stringify({ reply: message }),
});

    const data = await checkRes(res);
    if (data.success) {
      alert("Reply sent");
      setReplyMessage("");
      closeModal("replyFeedbackId");
      loadFeedbacks();
    } else {
      alert(data.message || "Failed to send reply");
    }
  } catch (err) {
    console.error("sendReply:", err);
    alert("Error sending reply");
  }
};


  // ------------------ File upload ------------------
  const uploadResume = async (studentId, file) => {
    if (!file) return alert("Select a file");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/students/${studentId}/certificates/resume`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Resume uploaded successfully");
        loadStudents();
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading resume:", err);
      alert("Error uploading resume");
    }
  };

  const deleteResume = async (studentId) => {
    if (!window.confirm("Remove resume?")) return;
    try {
      const res = await fetch(`${API}/api/students/${studentId}/delete-doc/resume`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Resume deleted successfully");
        loadStudents();
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Error deleting resume");
    }
  };

  // Upload student sheet (CSV)
  const uploadStudentSheet = async (file) => {
    if (!file) return alert("Select a CSV file first!");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/admins/upload-students`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await checkRes(res);
      if (data.success) {
        alert(data.message || "✅ Students imported successfully!");
        loadStudents();
      } else {
        alert(data.message || "❌ Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading student sheet");
    }
  };

  // Generic upload for marksheet, idProof, certificates, and offerLetters (Option A)
const uploadDoc = async (files, studentId, docMeta = {}) => {
  try {
    const fd = new FormData();

    if (files instanceof FileList || Array.isArray(files)) {
      for (let f of files) fd.append("certificate", f);
    } else {
      fd.append("certificate", files);
    }

    fd.append("studentId", studentId);
    fd.append("type", docMeta.type || "");
    fd.append("title", docMeta.title || "");
    fd.append("issuer", docMeta.issuer || "");
    fd.append("date", docMeta.date || "");

    const res = await fetch(`${API}/api/certificates`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });

    const data = await res.json();
    if (data.success) {
      alert("Certificate uploaded!");
      loadStudents();
    } else {
      alert(data.error || "Upload failed");
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload error");
  }
};


const deleteDoc = async (docType, studentId, index = null) => {
  if (!window.confirm("Delete document?")) return;
  try {
    const url =
      index !== null
        ? `${API}/api/students/${studentId}/delete-doc/${docType}/${index}`
        : `${API}/api/students/${studentId}/delete-doc/${docType}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await checkRes(res);
    if (data.success) {
      alert(`✅ ${docType} removed`);
      loadStudents();
    } else alert(data.message || "Failed to delete");
  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete error");
  }
};


  // ------------------ Admin management ------------------
  const resetAdminPassword = async (adminId, password) => {
    if (!password || password.length < 6) return alert("Password must be at least 6 chars");
    if (!window.confirm("Reset password for this admin?")) return;
    try {
      const res = await fetch(`${API}/api/admins/reset-password/${adminId}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ password })
      });
      const data = await checkRes(res);
      if (data.success) {
        alert("✅ Admin password reset");
        await loadAdmins();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.error("resetAdminPassword:", err);
      alert("Error resetting password");
    }
  };

  // Notification send state
const [notificationMessage, setNotificationMessage] = useState("");
const [notificationTarget, setNotificationTarget] = useState("all");

// Notification list state (if using notification list modal)
const [notifications, setNotifications] = useState([]);

// Feedback reply modal state (if you have a separate reply modal)
const [replyMessage, setReplyMessage] = useState("");
const [selectedFeedbackStatus, setSelectedFeedbackStatus] = useState("sent");

// Handler for sending notification
const handleSendNotif = () => {
  if (!notificationMessage.trim()) return alert("Please enter a message.");
  sendNotification(notificationMessage, notificationTarget);
  setNotificationMessage("");
  alert("✅ Notification sent successfully!");
};


  // changeApplicationStatus: optimistic update with proper revert and full API path
  const changeApplicationStatus = async (id, newStatus) => {
    // find previous status
    const prev = applications.find(a => a._id === id);
    const prevStatus = prev ? prev.status : null;

    // optimistic update
    setApplications(prevList => prevList.map(a => (a._id === id ? { ...a, status: newStatus } : a)));

    try {
      const endpoint = `${API}/api/applications/${id}/status`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await checkRes(res);
      if (!data.success) {
        console.error(data.error || "Failed to update status");
        // revert
        setApplications(prevList => prevList.map(a => (a._id === id ? { ...a, status: prevStatus } : a)));
      } else {
        console.log(`Application status changed to ${newStatus} successfully`);
        // Optionally reload single application or list here
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      setApplications(prevList => prevList.map(a => (a._id === id ? { ...a, status: prevStatus } : a)));
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="admin-container">{}
      {/* Sidebar */}
      <div className="sidebar">
        <h2>🚀 TPO PANEL</h2>

        {["dashboard", "students", "applications", "drives", "analytics"].map(tab => (
          <a key={tab} className={page === tab ? "active" : ""} onClick={() => setPage(tab)}>
            {tab === "dashboard" && "📊 Dashboard"}
            {tab === "students" && "👨‍🎓 Students"}
            {tab === "applications" && "📝 Applications"}
            {tab === "drives" && "🏢 Drives"}
            {tab === "analytics" && "📈 Analytics"}
          </a>
        ))}

<a onClick={() => setModal(prev => ({ ...prev, notifications: true }))}>Send Notification</a>
  <a onClick={() => setModal(prev => ({ ...prev, notificationList: true }))}>Notification List</a>
  <a onClick={() => setModal(prev => ({ ...prev, feedback: true }))}>Feedback Inbox</a>
        <a onClick={() => { loadAdmins(); setModal(prev => ({ ...prev, manageAdmins: true })); }}>🛠️ Manage Admins</a>
        <a onClick={logout}>🚪 Logout</a>
      </div>

      <div className="main">
        <div className="header">
          <h1>{page.toUpperCase()}</h1>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

        {/* Dashboard */}
        {page === "dashboard" && (
          <div className="page">
            <div className="cards">
              <div className="card c1"><h2>{stats.totalStudents}</h2><p>Total Students</p></div>
              <div className="card c2"><h2>{stats.totalApplications}</h2><p>Applications</p></div>
              <div className="card c3"><h2>{stats.placedStudents}</h2><p>Placed</p></div>
              <div className="card c4"><h2>{stats.avgCGPA}</h2><p>Avg CGPA</p></div>
            </div>

            <div className="quick-actions">
              <button onClick={() => exportCSV(students, "students-list")} className="export-btn">📥 Export Students</button>
              <button onClick={() => exportCSV(applications, "applications-list")} className="export-btn">📥 Export Applications</button>
              <button onClick={() => exportCSV(drives, "drives-list")} className="export-btn">📥 Export Drives</button>
            </div>
          </div>
        )}

        {/* Students */}
        {page === "students" && (
          <div className="page">
            <div className="filters-section">
              <input
                className="search-box"
                placeholder="Search by name, roll or email"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />

              <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                <option>All</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>

              <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option>All</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>

              <button className="export-btn" onClick={() => exportCSV(filteredStudents, "students")}>📥 Export CSV</button>
              <button className="upload-btn" onClick={() => setModal(prev => ({ ...prev, uploadSheet: true }))}>📤 Upload Sheet</button>
            </div>

            <div className="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll No</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.roll}</td>
                      <td>{s.branch}</td>
                      <td>{s.cgpa}</td>
                      <td>
                        <button onClick={() => openModal("viewStudent", s)}>👁️</button>
                        <button onClick={() => openModal("editStudent", s)}>✏️</button>
                        <button onClick={() => openModal("resetPass", s)}>🔑</button>
                        <button onClick={() => deleteStudent(s._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}

        {/* Applications */}
        {page === "applications" && (
          <div className="page">
            <div className="filters-section">
              <input
                className="search-box"
                placeholder="Search by student or company"
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
              />

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option>Applied</option>
                <option>Shortlisted</option>
                <option>Interviewed</option>
                <option>Placed</option>
                <option>Rejected</option>
              </select>

              <button
                className="export-btn"
                onClick={() => exportCSV(filteredApplications, "applications")}
              >
                📥 Export CSV
              </button>
            </div>

            <div className="table-box">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map(a => (
                    <tr key={a._id}>
                      <td>{a.name || a.studentName}</td>
                      <td>{a.roll}</td>
                      <td>{a.company}</td>
                      <td>{a.jobRole || a.role}</td>

                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background:
                              a.status === "Approved"
                                ? "#4caf50"
                                : a.status === "Rejected"
                                ? "#ff5252"
                                : "#ffa726",
                            color: "#fff"
                          }}
                        >
                          {a.status}
                        </span>
                      </td>

                      <td>
                        {a.appliedDate
                          ? new Date(a.appliedDate).toLocaleDateString()
                          : a.appliedOn
                            ? new Date(a.appliedOn).toLocaleDateString()
                            : "N/A"}
                      </td>

                      <td>
                        <select
                          value={a.status}
                          onChange={(e) => changeApplicationStatus(a._id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "#222",
                            color: "#fff",
                            border: "1px solid #555",
                            cursor: "pointer"
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        )}

        {/* Drives */}
        {page === "drives" && (
          <div className="page">
            <div className="table-box">
              <h2>Company Drives</h2>
              <button className="btn-primary" onClick={() => openModal("createDrive")}>
                ➕ Add Drive
              </button>

              <div style={{ marginTop: 12 }}>
                <input
                  placeholder="Search drives..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  className="search-box"
                />
                <button className="export-btn" onClick={() => exportCSV(filteredDrives, "drives")}>📥 Export CSV</button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>CTC</th>
                    <th>Date</th>
                    <th>Applicants</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDrives.map((d) => (
                    <tr key={d._id}>
                      <td>{d.company}</td>
                      <td>{d.role}</td>
                      <td>{d.ctc}</td>
                      <td>{d.driveDate ? new Date(d.driveDate).toLocaleDateString("en-GB") : "N/A"}</td>
                      <td>
                        <button onClick={() => viewDriveApplicants(d)}>View</button>
                      </td>
                      <td>
                        <button onClick={() => { setNewDrive(d); openModal("editDrive", d); }}>✏️</button>
                        <button onClick={() => deleteDrive(d._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {page === "analytics" && (
          <div className="page analytics-grid">
            <div className="analytics-card">
              <h3>Placement Rate</h3>
              <h1>
                {stats.totalStudents
                  ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
                  : 0}
                %
              </h1>
            </div>

            <div className="analytics-card">
              <h3>Branch-wise</h3>
              {stats.branchWise && Object.entries(stats.branchWise).map(([branch, count]) => (
                <p key={branch}>
                  {branch}: {count}
                </p>
              ))}
            </div>

            <div className="analytics-card">
              <h3>Status-wise</h3>
              {stats.statusWise && Object.entries(stats.statusWise).map(([status, count]) => (
                <p key={status}>
                  {status}: {count}
                </p>
              ))}
            </div>
          </div>
        )}

{page === "feedback" && (
  <section className="card-grid">
    <div className="card wide glass">
      <h3>💬 Student Feedback Inbox</h3>

      {loadingFeedbacks ? (
        <p className="muted">Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p className="muted">No feedback received yet.</p>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="feedback-item glass">
              <div className="feedback-header">
                <strong>{fb.studentName || "Anonymous"}</strong>
                <span className="feedback-date">
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="feedback-text">{fb.text}</p>

              <div className="feedback-actions">
                <select
                  value={fb.status}
                  onChange={(e) =>
                    updateFeedbackStatus(fb._id, e.target.value, fb.reply)
                  }
                >
                  <option value="sent">Sent</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
                <input
                  type="text"
                  placeholder="Reply..."
                  value={fb.reply || ""}
                  onChange={(e) =>
                    updateFeedbackStatus(fb._id, fb.status, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)}

        {/* ---------------------- MODALS ---------------------- */}

        {/* View Student */}
        {modal.viewStudent && selectedStudent && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Student Profile</h2>

              <div className="student-profile-modal">
                <div className="profile-left">
                  <div className="profile-avatar-large">{(selectedStudent.name || "").charAt(0).toUpperCase()}</div>
                  <h3>{selectedStudent.name}</h3>
                  <p>{selectedStudent.email}</p>
                  <p><strong>Roll:</strong> {selectedStudent.roll}</p>
                  <p><strong>Phone:</strong> {selectedStudent.phone || "Not provided"}</p>
                  <p><strong>Branch:</strong> {selectedStudent.branch}</p>
                  <p><strong>Year:</strong> {normalizeYearLabel(selectedStudent.year)}</p>
                  <p><strong>CGPA:</strong> {selectedStudent.cgpa}</p>

                  <div className="resume-actions">
                    {selectedStudent.resume ? (
                      <>
                        <a href={`${API}/uploads/${selectedStudent.resume}`} target="_blank" rel="noreferrer">📄 View Resume</a>
                        <button onClick={() => deleteResume(selectedStudent._id)}>Remove Resume</button>
                      </>
                    ) : (
                      <label>
                        Upload Resume:
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => uploadResume(selectedStudent._id, e.target.files[0])} />
                      </label>
                    )}
                  </div>

                  <div className="admin-actions">
                    <button onClick={() => openModal("editStudent", selectedStudent)}>✏️ Edit</button>
                    <button onClick={() => openModal("resetPass", selectedStudent)}>🔑 Reset Password</button>
                  </div>

                  <div className="doc-upload-section">
                    <h3>Student Documents</h3>

                    <div>
                      <strong>Marksheet:</strong>{" "}
                      {selectedStudent.documents?.marksheet ? (
                        <>
                          <a href={`${API}/uploads/${selectedStudent.documents.marksheet}`} target="_blank" rel="noreferrer">View</a>
                          <button onClick={() => deleteDoc("marksheet", selectedStudent._id)}>Remove</button>
                        </>
                      ) : (
                        <input type="file" onChange={e => uploadDoc(e.target.files[0], "marksheet", selectedStudent._id)} />
                      )}
                    </div>

                    <div>
                      <strong>ID Proof:</strong>{" "}
                      {selectedStudent.documents?.idProof ? (
                        <>
                          <a href={`${API}/uploads/${selectedStudent.documents.idProof}`} target="_blank" rel="noreferrer">View</a>
                          <button onClick={() => deleteDoc("idProof", selectedStudent._id)}>Remove</button>
                        </>
                      ) : (
                        <input type="file" onChange={e => uploadDoc(e.target.files[0], "idProof", selectedStudent._id)} />
                      )}
                    </div>

                    <div>
                      <strong>Certificates:</strong>
                      <ul>
                        {(selectedStudent.documents?.certificates || []).map((url, i) => (
                          <li key={i}>
                            <a href={`${API}/uploads/${url}`} target="_blank" rel="noreferrer">Certificate {i + 1}</a>
                            <button onClick={() => deleteDoc("certificates", selectedStudent._id, i)}>Remove</button>
                          </li>
                        ))}
                      </ul>
                      <input type="file" multiple onChange={e => uploadDoc(e.target.files, "certificates", selectedStudent._id)} />
                    </div>

                    <div>
                      <strong>Offer Letters:</strong>
                      <ul>
                        {(selectedStudent.documents?.offerLetters || []).map((url, i) => (
                          <li key={i}>
                            <a href={`${API}/uploads/${url}`} target="_blank" rel="noreferrer">Offer Letter {i + 1}</a>
                            <button onClick={() => deleteDoc("offerLetters", selectedStudent._id, i)}>Remove</button>
                          </li>
                        ))}
                      </ul>
                      <input type="file" multiple onChange={e => uploadDoc(e.target.files, "offerLetters", selectedStudent._id)} />
                    </div>
                  </div>
                </div>

                <div className="profile-right">
                  <div className="detail-item full-width">
                    <span className="detail-label">💼 Skills:</span>
                    <span className="detail-value">{(selectedStudent.skills && Array.isArray(selectedStudent.skills)) ? selectedStudent.skills.join(", ") : (selectedStudent.skills || "No skills added")}</span>
                  </div>

                  {selectedStudent.bio && (
                    <div className="detail-item full-width">
                      <span className="detail-label">📝 Bio:</span>
                      <span className="detail-value">{selectedStudent.bio}</span>
                    </div>
                  )}

                  <hr />
                  <h4>Applications</h4>
                  <div className="applications-list">
                    {applications.filter(a => a.studentId === selectedStudent._id).length === 0 ? (
                      <p>No applications</p>
                    ) : (
                      <table className="small-table">
                        <thead><tr><th>Company</th><th>Role</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                          {applications.filter(a => a.studentId === selectedStudent._id).map(app => (
                            <tr key={app._id}>
                              <td>{app.companyName || app.company}</td>
                              <td>{app.role || app.jobRole}</td>
                              <td>
                                {app.appliedOn ? new Date(app.appliedOn).toLocaleDateString()
                                  : app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "N/A"}
                              </td>
                              <td>{app.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <hr />
                  <h4>Eligible Drives</h4>
                  <div className="drives-eligibility">
                    {drives.map(d => {
                      const eligibleByBranch = !d.eligibleBranches?.length || d.eligibleBranches.includes(selectedStudent.branch);
                      const eligibleByCgpa = !d.minCgpa || parseFloat(selectedStudent.cgpa || 0) >= parseFloat(d.minCgpa || 0);
                      const eligible = eligibleByBranch && eligibleByCgpa;

                      return (
                        <div key={d._id} className="drive-mini-card">
                          <strong>{d.company}</strong> - {d.role}
                          <div>Min CGPA: {d.minCgpa || "N/A"}</div>
                          <div>Branches: {d.eligibleBranches?.length ? d.eligibleBranches.join(", ") : "All"}</div>
                          {eligible ? (
                            <button onClick={() => adminApplyToDrive(selectedStudent._id, d._id)}>➡ Apply</button>
                          ) : (
                            <button disabled>Not Eligible</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => closeModal("viewStudent")}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student */}
        {modal.editStudent && selectedStudent && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <h2>Edit Student</h2>
              <EditStudentForm
                student={selectedStudent}
                onSave={updateStudent}
                onCancel={() => closeModal("editStudent")}
              />
            </div>
          </div>
        )}

        {/* Reset Student Password */}
        {modal.resetPass && selectedStudent && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Reset Password for {selectedStudent.name}</h2>
              <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <div className="modal-actions">
                <button onClick={() => resetPassword(selectedStudent._id)}>Save</button>
                <button onClick={() => closeModal("resetPass")}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Drive (single modal) */}
        {(modal.createDrive || modal.editDrive) && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <h2>{modal.editDrive ? "Edit Drive" : "Create Drive"}</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label>Company</label>
                  <input value={newDrive.company} onChange={e => setNewDrive({ ...newDrive, company: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input value={newDrive.role} onChange={e => setNewDrive({ ...newDrive, role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>CTC</label>
                  <input value={newDrive.ctc} onChange={e => setNewDrive({ ...newDrive, ctc: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={newDrive.driveDate?.split("T")[0] || newDrive.driveDate} onChange={e => setNewDrive({ ...newDrive, driveDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" value={newDrive.deadline?.split("T")[0] || newDrive.deadline} onChange={e => setNewDrive({ ...newDrive, deadline: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Min CGPA</label>
                  <input type="number" step="0.01" value={newDrive.minCgpa} onChange={e => setNewDrive({ ...newDrive, minCgpa: e.target.value })} />
                </div>

                <div className="form-group full-width">
                  <label>Eligible Branches (comma separated)</label>
                  <input
                    value={newDrive.eligibleBranches?.join(", ") || ""}
                    onChange={e => setNewDrive({ ...newDrive, eligibleBranches: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea value={newDrive.description} onChange={e => setNewDrive({ ...newDrive, description: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={saveDrive}>Save Drive</button>
                <button onClick={() => { setNewDrive(emptyDrive); closeModal(modal.editDrive ? "editDrive" : "createDrive"); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* View Drive Applicants */}
        {modal.viewDriveApplicants && selectedDrive && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <h2>Applicants for {selectedDrive.company} - {selectedDrive.role}</h2>
              {driveApplicants.length === 0 ? (
                <p>No applicants</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll</th>
                      <th>CGPA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driveApplicants.map(a => (
                      <tr key={a._id}>
                        <td>{a.name}</td>
                        <td>{a.roll}</td>
                        <td>{a.cgpa}</td>
                        <td>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="modal-actions">
                <button onClick={() => closeModal("viewDriveApplicants")}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Student Sheet */}
        {modal.uploadSheet && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Upload Student Sheet (Excel / CSV)</h2>
              <p>Required columns: studentId, name, roll, email, phone, branch,password</p>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => uploadStudentSheet(e.target.files[0])} />
              <div className="modal-actions">
                <button onClick={() => closeModal("uploadSheet")}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications + Feedback Inbox */}
        {modal.notifications && (
  <div className="modal-overlay">
    <div className="modal wide-modal">
      <h2>📢 Send Notification</h2>
      <div className="notif-send-section">
        <h4>Send Notification</h4>
        <textarea
          placeholder="Type notification message..."
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
        />
        <select
          value={notificationTarget}
          onChange={(e) => setNotificationTarget(e.target.value)}
        >
          <option value="all">All Students</option>
          <option value="branch">By Branch</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSendNotif}>Send</button>
          <button onClick={() => closeModal("notifications")}>Close</button>
        </div>
      </div>
    </div>
  </div>
)}


{modal.feedback && (
  <div className="modal-overlay">
    <div className="modal wide-modal">
      <h2>💬 Student Feedback Inbox</h2>

      {loadingFeedbacks ? (
        <p className="muted">Loading feedbacks...</p>
      ) : !Array.isArray(feedbacks) || feedbacks.length === 0 ? (
        <p className="muted">No feedback received yet.</p>
      ) : (
        <div className="feedback-list">
          {(feedbacks ?? []).map((fb) => (
            <div key={fb._id} className="feedback-item">
              <p><strong>{fb.studentName}</strong></p>
              <p>{fb.message}</p>
              <p>Status: {fb.status}</p>

              <button
                onClick={() =>
                  setModal(prev => ({ ...prev, replyFeedbackId: fb._id }))
                }
              >
                Reply
              </button>

              <button
                onClick={() =>
                  setModal(prev => ({ ...prev, feedbackStatus: fb._id }))
                }
              >
                Change Status
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => closeModal("feedback")}>Close</button>
    </div>
  </div>
)}


{modal.replyFeedbackId && (
  <div className="modal-overlay">
    <div className="modal">
      <h4>Reply to Feedback</h4>
      <textarea
        value={replyMessage}
        onChange={e => setReplyMessage(e.target.value)}
      />
      <button onClick={() => sendReply(modal.replyFeedbackId, replyMessage)}>Send Reply</button>
      <button onClick={() => closeModal("replyFeedbackId")}>Cancel</button>
    </div>
  </div>
)}

{modal.feedbackStatus && (
  <div className="modal-overlay">
    <div className="modal">
      <h4>Manage Feedback Status</h4>
      <select
        value={selectedFeedbackStatus}
        onChange={e => setSelectedFeedbackStatus(e.target.value)}
      >
        <option value="sent">Sent</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <button onClick={() => updateFeedbackStatus(modal.feedbackStatus, selectedFeedbackStatus)}>Update</button>
      <button onClick={() => closeModal("feedbackStatus")}>Cancel</button>
    </div>
  </div>
)}


        {/* Manage Admins */}
        {modal.manageAdmins && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <h2>Manage Admins</h2>

              <div style={{ maxHeight: 300, overflow: "auto" }}>
                <table className="small-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {admins.map(a => (
                      <tr key={a._id}>
                        <td>{a.username}</td>
                        <td>{a.email}</td>
                        <td>{a.role || "admin"}</td>
                        <td>
                          <button
                            onClick={() => {
                              const pw = prompt("Enter new password (min 6 chars):");
                              if (pw && pw.length >= 6) {
                                resetAdminPassword(a._id, pw);
                              } else if (pw) {
                                alert("Password must be at least 6 characters");
                              }
                            }}
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button onClick={() => closeModal("manageAdmins")}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------ EditStudentForm Component ------------------
function EditStudentForm({ student, onSave, onCancel }) {
  const [form, setForm] = useState({
    _id: student._id,
    name: student.name || "",
    email: student.email || "",
    roll: student.roll || "",
    phone: student.phone || "",
    branch: student.branch || "",
    year: student.year || "",
    cgpa: student.cgpa || "",
    skills: Array.isArray(student.skills) ? student.skills.join(", ") : (student.skills || ""),
    bio: student.bio || ""
  });

  useEffect(() => {
    setForm({
      _id: student._id,
      name: student.name || "",
      email: student.email || "",
      roll: student.roll || "",
      phone: student.phone || "",
      branch: student.branch || "",
      year: student.year || "",
      cgpa: student.cgpa || "",
      skills: Array.isArray(student.skills) ? student.skills.join(", ") : (student.skills || ""),
      bio: student.bio || ""
    });
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Name & Email required");

    // Convert skills string -> array before sending
    const payload = {
      ...form,
      skills: typeof form.skills === "string" ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : form.skills
    };

    onSave(payload);
  };

  return (
    <form className="edit-student-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Roll</label>
          <input value={form.roll} onChange={e => setForm({ ...form, roll: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Branch</label>
          <input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Year</label>
          <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
        </div>
        <div className="form-group">
          <label>CGPA</label>
          <input type="number" step="0.01" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} />
        </div>

        <div className="form-group full-width">
          <label>Skills (comma separated)</label>
          <input
            value={form.skills}
            onChange={e => setForm({ ...form, skills: e.target.value })}
            placeholder="e.g. React, Node, Python"
          />
        </div>

        <div className="form-group full-width">
          <label>Bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default AdminDashboard;
