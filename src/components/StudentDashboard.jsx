// StudentDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
const API = "http://localhost:5000";

/*
  Ultra Premium Glass Student Dashboard (Dark) - Version A
  - Chat, Notifications, Scheduling, Offer letters, Photo upload,
    Drive filters, Resume builder, Analytics, Document verification,
    Help bot, Feedback routing, Smart alerts
*/const authJSON = {
  "Content-Type": "applications/json",
  "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
};

const THEME_COLORS = {
  blue: "#1d4ed8",
  purple: "#7c3aed",
  green: "#10b981",
  orange: "#f97316"
};

/* ---------- Small helper components (Donut & Bar) ---------- */
function SmallDonut({ stats, size = 120 }) {
  const total = Object.values(stats).reduce((s, v) => s + (v || 0), 0) || 1;
  const applied = stats.Applied || 0;
  const accepted = stats.Accepted || 0;
  const rejected = stats.Rejected || 0;

  const pctA = (applied / total) * 100;
  const pctB = (accepted / total) * 100;
  const pctC = (rejected / total) * 100;

  const r = (size / 2) - 10;
  const c = 2 * Math.PI * r;

  const lenA = (pctA / 100) * c;
  const lenB = (pctB / 100) * c;
  const lenC = c - lenA - lenB;
 
  

/* ---------- RENDER  ---------- */
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="small-donut">
      <g transform={`translate(${size/2},${size/2})`}>
        <circle r={r} fill="transparent" stroke="#0b1220" strokeWidth={12} />
        <circle
          r={r}
          fill="transparent"
          stroke="#60a5fa"
          strokeWidth={12}
          strokeDasharray={`${lenA} ${c - lenA}`}
          strokeLinecap="round"
          transform={`rotate(-90)`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
        <circle
          r={r}
          fill="transparent"
          stroke="#34d399"
          strokeWidth={12}
          strokeDasharray={`${lenB} ${c - lenB}`}
          strokeLinecap="round"
          transform={`rotate(-90)`}
          style={{ transition: "stroke-dasharray 700ms ease, transform 700ms ease" }}
        />
        <circle
          r={r}
          fill="transparent"
          stroke="#fb7185"
          strokeWidth={12}
          strokeDasharray={`${lenC} ${c - lenC}`}
          strokeLinecap="round"
          transform={`rotate(-90)`}
          style={{ transition: "stroke-dasharray 700ms ease, transform 700ms ease" }}
        />
      </g>
    </svg>
  );
}

function BarChart({ items = [], height = 120 }) {
  const max = Math.max(...items.map(i => i.value || 0), 1);
  return (
    <div className="chart-bar" style={{ height }}>
      {items.map((it) => (
        <div
          key={it.label || Math.random()}  // ✅ use label or fallback
          className="chart-bar-item"
          title={`${it.label}: ${it.value}`}
        >
          <div
            className="chart-bar-fill"
            style={{
              height: `${(it.value / max) * 100}%`,
              transition: "height 700ms ease"
            }}
          />
          <div className="chart-bar-label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}


/* ---------- helper to shade color a bit ---------- */
function shadeColor(hex, percent) {
  if (!hex) return "#4f46e5";
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = Math.round((t - (f >> 16)) * p) + (f >> 16);
  const G = Math.round((t - ((f >> 8) & 0x00ff)) * p) + ((f >> 8) & 0x00ff);
  const B = Math.round((t - (f & 0x0000ff)) * p) + (f & 0x0000ff);
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

/* ---------- main component ---------- */
export default function StudentDashboard() {

  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [page, setPage] = useState("profile");
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // ✅ MOVE THEM HERE (TOP LEVEL)
  const [certificateTitle, setCertificateTitle] = useState("");
  const [certificateIssuer, setCertificateIssuer] = useState("");
  const [certificateDate, setCertificateDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);


  const notifRef = useRef();

 


  const [calendar, setCalendar] = useState([
    { id: "cal1", company: "Infosys", date: "2025-11-11T10:00:00", status: "Confirmed", slot: "10:00 AM" },
    { id: "cal2", company: "Google", date: "2025-12-01T14:00:00", status: "Pending", slot: "02:00 PM" }
  ]);
  const PREP_LINKS = [
    { title: "Aptitude Practice", url: "#" },
    { title: "Mock Interview Booking", url: "#" },
    { title: "Coding MCQs", url: "#" },
    { title: "Soft Skills Material", url: "#" }
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    cgpa: "",
    skills: "",
    bio: ""
  });
useEffect(() => {
  const handleClickOutside = (e) => {
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setNotifOpen(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  // theme
  const [dark, setDark] = useState(() => localStorage.getItem("student_theme_dark") !== "false"); // default dark
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem("student_theme_color") || "blue");
  const accentColor = useMemo(() => THEME_COLORS[themeColor] || THEME_COLORS.blue, [themeColor]);

  // chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const raw = localStorage.getItem("student_chat");
    return raw ? JSON.parse(raw) : [{ from: "admin", text: "Welcome to TPO chat. Ask your questions." }];
  });
  const [messageText, setMessageText] = useState("");

  // notifications
  const [notifications, setNotifications] = useState(() => {
    const raw = localStorage.getItem("student_notifications");
    return raw ? JSON.parse(raw) : [];
  });
  const unreadCount = notifications.filter(n => !n.read).length;

  // help bot
  const [helpOpen, setHelpOpen] = useState(false);
  const [botHistory, setBotHistory] = useState(() => [{ from: "bot", text: "Hi — I'm the Placement Assistant. Ask me common questions." }]);
  const [botInput, setBotInput] = useState("");

  // feedback
  const [feedback, setFeedback] = useState("");
  const [feedbacks, setFeedbacks] = useState(() => {
    const raw = localStorage.getItem("student_feedbacks");
    return raw ? JSON.parse(raw) : [];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterEligibleCGPA, setFilterEligibleCGPA] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // resume builder preview data
  const resumeRef = useRef();
  // API & handlers (kept simple; replace URLs with your backend)
  const fetchDrives = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/drives");
    const data = await res.json();

    if (data?.success && Array.isArray(data.drives)) {
      const normalized = data.drives.map(d => ({
        ...d,
        ctc: d.ctc || "—",
        location: d.location || "Not specified",
        driveDate: d.driveDate || d.date || new Date().toISOString(),
        minCgpa: d.minCgpa || 0,
        slots: d.slots || ["10:00 AM", "02:00 PM"],
        status: d.status || "Open",
        description: d.description || "No description provided",
      }));
      setDrives(normalized);
    } else {
      // 🧩 fallback demo drives
      setDrives([
        {
          _id: "d1",
          company: "Infosys",
          role: "Software Engineer",
          ctc: "6 LPA",
          location: "Mumbai",
          driveDate: "2025-11-20T10:00:00",
          status: "Open",
          minCgpa: 7.0,
          slots: ["10:00 AM", "02:00 PM"],
          description: "On-campus drive.",
        },
        {
          _id: "d2",
          company: "Google",
          role: "SWE Intern",
          ctc: "20 LPA",
          location: "Bengaluru",
          driveDate: "2025-12-01T14:00:00",
          status: "Open",
          minCgpa: 8.0,
          slots: ["11:00 AM", "03:00 PM"],
          description: "Off-campus drive.",
        },
      ]);
    }
  } catch (e) {
    console.warn("⚠️ Drives fetch error:", e);
    // fallback demo drives
    setDrives([
      {
        _id: "d1",
        company: "Infosys",
        role: "Software Engineer",
        ctc: "6 LPA",
        location: "Mumbai",
        driveDate: "2025-11-20T10:00:00",
        status: "Open",
        minCgpa: 7.0,
        slots: ["10:00 AM", "02:00 PM"],
        description: "On-campus drive.",
      },
      {
        _id: "d2",
        company: "Google",
        role: "SWE Intern",
        ctc: "20 LPA",
        location: "Bengaluru",
        driveDate: "2025-12-01T14:00:00",
        status: "Open",
        minCgpa: 8.0,
        slots: ["11:00 AM", "03:00 PM"],
        description: "Off-campus drive.",
      },
    ]);
  }
};



const fetchApplications = async (studentId) => {
  if (!studentId) return [];

  if (studentId.startsWith("demo")) {
    const demoApps = [
      { driveId: "d1", company: "Infosys", jobRole: "Software Engineer", status: "Applied" },
      { driveId: "d2", company: "Google", jobRole: "SWE Intern", status: "Placed" }
    ];
    setApplications(demoApps);
    return demoApps;
  }

  try {
    const res = await fetch(`${API}/api/applications?studentId=${studentId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("studentToken")}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    const apps = data.success && Array.isArray(data.applications) ? data.applications : [];
    setApplications(apps);
    return apps;
  } catch (err) {
    console.error("fetchApplications:", err);
    setApplications([]);
    return [];
  }
};



 useEffect(() => {
  const init = async () => {
    setIsLoading(true);

    const token = localStorage.getItem("studentToken");

    const studentData = localStorage.getItem("student");

    // Demo / not logged in
    if (!token || !studentData || studentData === "undefined") {
      const demo = {
        _id: "demo-1",
        name: "Vedant",
        email: "vedant@example.com",
        phone: "9999999999",
        branch: "Computer Science",
        year: "3",
        cgpa: "8.4",
        skills: "React, Node",
        bio: "Enthusiastic developer"
      };
      setStudent(demo);
      setEditForm(demo);

      try {
        await fetchDrives();
        await fetchApplications(demo._id);
      } catch (e) {
        console.error("Demo data fetch error:", e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Logged-in student
    try {
      const parsed = JSON.parse(studentData);
      setStudent(parsed);
      setEditForm(prev => ({ ...prev, ...parsed }));

      await fetchDrives();

      const studentId = parsed._id;
      await fetchApplications(studentId);
 // fetch apps for this student

    } catch (e) {
      console.error("Failed to parse student or fetch data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  init();
}, []);


  useEffect(() => {
    localStorage.setItem("student_theme_dark", dark ? "true" : "false");
    localStorage.setItem("student_theme_color", themeColor);
    document.documentElement.classList.toggle("student-dark", dark);
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty("--accent-600", shadeColor(accentColor, -10));
  }, [dark, themeColor, accentColor]);

  useEffect(() => {
    localStorage.setItem("student_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("student_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("student_feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Smart alerts: check drives & calendar for upcoming events
  const [alerts, setAlerts] = useState([]);

useEffect(() => {
  if (!drives?.length && !calendar?.length) return;

  const now = Date.now();
  const newAlerts = [];

  drives.forEach((d) => {
    const driveTime = new Date(d.driveDate ?? d.date).getTime();
    if (!driveTime || d.status === "Closed") return;

    const timeLeft = driveTime - now;

    if (timeLeft <= 24 * 3600 * 1000 && timeLeft > 0) {
      newAlerts.push({
        _id: `drive-soon-${d._id}`,
        title: `Drive soon: ${d.company}`,
        text: `${d.company} drive is happening on ${new Date(driveTime).toLocaleString()}`,
        when: d.driveDate,
        read: false,
      });
    }

    if (timeLeft <= 3 * 3600 * 1000 && timeLeft > 0) {
      newAlerts.push({
        _id: `drive-urgent-${d._id}`,
        title: `Closing soon: ${d.company}`,
        text: `${d.company} drive closing in under 3 hours.`,
        when: d.driveDate,
        read: false,
      });
    }
  });

  calendar.forEach((ev) => {
    const eventTime = new Date(ev.date).getTime();
    const timeLeft = eventTime - now;

    if (timeLeft <= 24 * 3600 * 1000 && timeLeft > 0) {
      newAlerts.push({
        _id: `calendar-${ev._id}`,
        title: `Interview tomorrow: ${ev.company}`,
        text: `${ev.company} interview on ${new Date(ev.date).toLocaleString()}`,
        when: ev.date,
        read: false,
      });
    }
  });

  // ✅ Remove duplicates and expired alerts
  const uniqueAlerts = Array.from(new Map(newAlerts.map(a => [a._id, a])).values())
    .filter(a => new Date(a.when).getTime() > now);

  setAlerts(uniqueAlerts);

}, [drives, calendar]);



  const docTypes = [
  "Marksheet",
  "ID Proof",
  "Certificate",
  "Offer Letter"
];

const [selectedType, setSelectedType] = useState(docTypes[0]);

// ✅ move all hooks ABOVE the early return
const filteredDrives = useMemo(() => {
  return drives.filter(d => {
    if (searchTerm && ![d.company, d.role, d.location, d.package]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())) return false;
    if (filterBranch && student && d.branch && d.branch !== student.branch) return false;
    if (filterRole && !d.role.toLowerCase().includes(filterRole.toLowerCase())) return false;
    if (filterEligibleCGPA && student && d.eligiblityCGPA && Number(student.cgpa) < Number(filterEligibleCGPA)) return false;
    return true;
  });
}, [drives, searchTerm, filterBranch, filterRole, filterEligibleCGPA, student]);

const analytics = useMemo(() => {
  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const companyCounts = applications.reduce((acc, a) => {
    if (!a.company) return acc;
    acc[a.company] = (acc[a.company] || 0) + (a.status === "Placed" ? 1 : 0);
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ label: company, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return { statusCounts, topCompanies };
}, [applications]);

if (isLoading) return <div className="loading">Loading...</div>;

// ✅ keep the upload handler here


const handleFileUpload = async () => {
  if (!selectedFile) {
    alert("Please select a file first!");
    return;
  }

  setUploading(true);

  const formData = new FormData();
  formData.append("certificate", selectedFile);
  formData.append("studentId", student.id);
  formData.append("type", selectedType);
  formData.append("title", certificateTitle);
  formData.append("issuer", certificateIssuer);
  formData.append("date", certificateDate);

  try {
    const res = await fetch(`${API}/api/certificates`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      setUploadedDocs((prev) => [...prev, data.certificate]);

      pushNotification({
        title: "Document Uploaded",
        text: selectedFile.name
      });

      // Clear fields
      setSelectedFile(null);
      setCertificateTitle("");
      setCertificateIssuer("");
      setCertificateDate("");
    }
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    setUploading(false);
  }
};





  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!student) return;
    // PUT to backend - kept simple; if backend absent, just update local storage
    try {
      // recommended: call your API here
      const updated = { ...student, ...editForm };
      setStudent(updated);
      setEditForm(updated);
      localStorage.setItem("student", JSON.stringify(updated));
      setIsEditing(false);
      pushNotification({ title: "Profile updated", text: "Your profile was saved successfully" });
    } catch (e) {
      console.error(e);
    }
  };
    const handleBookSlot = (driveId, slot) => {
    const drv = drives.find(d => d._id === driveId);
    if (!drv) return alert("Drive not found");

    const ev = {
      id: "bk-" + Date.now(),
      company: drv.company,
      date: new Date().toISOString(),
      status: "Booked",
      slot,
      driveId
    };

    setCalendar(prev => [ev, ...prev]);
    pushNotification({ title: "Interview Booked", text: `You booked ${drv.company} at ${slot}` });
  };
const handleApply = async (driveId) => {
  if (!student) return alert("Please login");

  // Check if already applied
  const already = applications.some(a => a.driveId === driveId);
  if (already) return alert("Already applied");

  try {
    const token = localStorage.getItem('token');
    const res = await fetch("http://localhost:5000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ driveId }) // backend will handle student info
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Fetch fresh applications from backend once
      await fetchApplications(student._id);
      alert("Application submitted successfully!");
    } else {
      alert("Failed to apply: " + (data.error || data.message));
    }
  } catch (e) {
    console.error("Error applying:", e);
    alert("Error connecting to backend!");
  }
};


  /* ---------- Chat ---------- */
  const sendMessage = (text) => {
    if (!text.trim()) return;
    const msg = { from: "me", text: text.trim(), at: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setMessageText("");
    // simulate admin reply
    setTimeout(() => {
      const reply = { from: "admin", text: `We received: "${text.trim().slice(0,90)}". Our TPO will respond within 24h.`, at: new Date().toISOString() };
      setMessages(prev => [...prev, reply]);
      pushNotification({ title: "Chat reply", text: `TPO replied to your message` });
    }, 1200);
  };

  /* ---------- Notifications ---------- */
  const pushNotification = (item) => {
    const id = item._id || "notif-" + Date.now();
    const n = { id, title: item.title, text: item.text, read: false, when: item.when || new Date().toISOString() };
    setNotifications(prev => [n, ...prev].slice(0, 100));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /* ---------- Offer letters (generate simple printable letter) ---------- */
  const generateOfferLetter = (applications) => {
    const html = `
      <html><head><title>Offer Letter</title><style>
      body{font-family:Inter, Arial; padding:28px; background:#f7fafc; color:#0b1220}
      .box{max-width:720px; margin:28px auto; padding:28px; border-radius:12px; background:white; box-shadow:0 12px 40px rgba(2,6,23,0.08);}
      h1{color:#0b1220}
      </style></head><body><div class="box"><h1>Offer Letter</h1>
      <p>Dear ${student.name},</p>
      <p>We are pleased to offer you the position of <strong>${applications.jobRole || applications.role}</strong> at <strong>${applications.company}</strong>.</p>
      <p>Please find details below:</p>
      <ul>
      <li>Package: ${applications.package || "As per company"}</li>
      <li>Joining: As communicated</li>
      </ul>
      <p>Regards,<br/>${applications.company} - Placement Team</p>
      </div></body></html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    // user can print/save to PDF
  };

  /* ---------- Resume Builder (printable HTML) ---------- */
const exportResume = () => {
  const safe = (v) => (v ? v : ""); // Prevent undefined in HTML

  const skillsHtml = Array.isArray(student.skills)
    ? student.skills.map(s => `<span class="chip">${s}</span>`).join("")
    : String(safe(student.skills))
        .split(",")
        .map(s => `<span class="chip">${s.trim()}</span>`)
        .join("");

  const applicationsHtml =
    Array.isArray(applications) && applications.length > 0
      ? applications
          .map(
            (a) => `
          <tr>
            <td>${safe(a.company)}</td>
            <td>${safe(a.jobRole || a.role)}</td>
            <td>${safe(a.status)}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="3" style="text-align:center; color:#999;">No applications yet</td></tr>`;

  const resumeHtml = `
  <html>
    <head>
      <title>Resume - ${safe(student.name)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #1f2937;
          background: #f9fafb;
          margin: 0;
          padding: 40px;
        }

        .resume-container {
          background: #ffffff;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 50px;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0,0,0,0.08);
        }

        h1 {
          font-size: 28px;
          margin-bottom: 4px;
          color: #111827;
        }

        .meta {
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .divider {
          height: 2px;
          background: #e5e7eb;
          margin: 20px 0;
        }

        h2 {
          font-size: 18px;
          color: #2563eb;
          margin-bottom: 8px;
          border-left: 4px solid #2563eb;
          padding-left: 10px;
        }

        p, li {
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .chip {
          background: #e0e7ff;
          color: #1e3a8a;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }

        table th, table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 14px;
        }

        table th {
          background: #f3f4f6;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #9ca3af;
        }

        @media print {
          body { background: #fff; }
          .resume-container { box-shadow: none; margin: 0; }
          .footer { display: none; }
        }
      </style>
    </head>

    <body>
      <div class="resume-container">
        <h1>${safe(student.name)}</h1>
        <div class="meta">
          ${safe(student.email)} | ${safe(student.phone)} | ${safe(student.branch)} <br>
          CGPA: ${safe(student.cgpa)}
        </div>

        <div class="divider"></div>

        <h2>Bio</h2>
        <p>${safe(student.bio) || "No bio available."}</p>

        <h2>Skills</h2>
        <div class="skills">${skillsHtml || "<p>No skills listed.</p>"}</div>

        <h2>Applications</h2>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${applicationsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated via Placement Portal • ${new Date().toLocaleDateString()}
        </div>
      </div>
    </body>
  </html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(resumeHtml);
    win.document.close();
  } else {
    alert("Popup blocked! Please allow popups to export resume.");
  }
};


  /* ---------- Help Bot ---------- */
  const botReply = (q) => {
    const ql = q.toLowerCase();
    if (ql.includes("how") && ql.includes("apply")) return "To apply to a drive, open Drives -> choose Apply. If you meet CGPA eligibility, you can apply immediately.";
    if (ql.includes("interview") && ql.includes("book")) return "Go to the drive details and click Book slot to reserve an interview time. You will receive a calendar entry.";
    if (ql.includes("resume")) return "Use 'Resume Builder' in the menu to export a printable resume from your profile data.";
    if (ql.includes("documents") || ql.includes("verify")) return "Upload documents on Documents tab. Verification depends on TPO - check status column.";
    return "I can help with applying, booking interviews, resume export, and documents. Try asking 'How to apply' or 'How to book interview'.";
  };

  const sendBot = () => {
    if (!botInput.trim()) return;
    const q = { from: "user", text: botInput, at: new Date().toISOString() };
    setBotHistory(prev => [...prev, q]);
    const ans = botReply(botInput);
    setTimeout(() => {
      const a = { from: "bot", text: ans, at: new Date().toISOString() };
      setBotHistory(prev => [...prev, a]);
    }, 600);
    setBotInput("");
  };

  /* ---------- Feedback submission (routes to TPO via localStorage placeholder) ---------- */
const handleFeedback = async () => {
  if (!feedback.trim()) return alert("Please enter feedback");

  // Try both token keys for compatibility
  const token = localStorage.getItem("token") || localStorage.getItem("studentToken");

  if (!token) return alert("❌ Student not logged in");

  try {
    const res = await fetch(`${API}/api/feedbacks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text: feedback.trim() }),
    });

    const data = await res.json();

    if (data.success) {
      setFeedbacks(prev => [data.feedback, ...prev]);
      setFeedback("");
      pushNotification({
        title: "Feedback Sent",
        text: "Your feedback was successfully submitted",
      });
    } else {
      alert(data.message || "Failed to send feedback");
    }

  } catch (err) {
    console.error(err);
    alert("Server error while sending feedback");
  }
};


  /* ---------- Helpers for application status ---------- */
  const isAlreadyApplied = (driveId) => applications.some(a => a.driveId === driveId);
  const getApplicationStatus = (driveId) => {
    const x = applications.find(a => a.driveId === driveId);
    return x ? x.status : null;
  };
  

  /* ---------- JSX ---------- */
  return (
    <div className="student-dashboard glass-layout student-dark">
      {/* Sidebar */}
      <aside className="sd-sidebar glass">
        <div className="sd-brand">
          <div className="sd-logo">🎓</div>
          <div className="sd-brand-text">
            <div className="sd-title">APSIT Placement</div>
            <div className="sd-sub">Student Portal</div>
          </div>
        </div>

        <nav className="sd-nav">
          <button className={page==="profile" ? "active" : ""} onClick={() => setPage("profile")}>👤 Profile</button>
          <button className={page==="drives" ? "active" : ""} onClick={() => setPage("drives")}>🏢 Drives</button>
          <button className={page==="applications" ? "active" : ""} onClick={() => setPage("applications")}>📋 Applications</button>
          <button className={page==="analytics" ? "active" : ""} onClick={() => setPage("analytics")}>📈 Analytics</button>
          <button className={page==="uploadDocs" ? "active" : ""} onClick={() => setPage("uploadDocs")}>📤 Documents</button>
          <button className={page==="calendar" ? "active" : ""} onClick={() => setPage("calendar")}>🗓️ Schedule</button>
          <button className={page==="resume" ? "active" : ""} onClick={() => setPage("resume")}>🧾 Resume Builder</button>
          <button className={page==="preparation" ? "active" : ""} onClick={() => setPage("preparation")}>📚 Prep</button>
          <button className={page==="feedback" ? "active" : ""} onClick={() => setPage("feedback")}>💬 Feedback</button>
        </nav>

        <div className="sd-controls">
          <div className="toggle-row">
            <label className="switch">
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
              <span className="slider" />
            </label>
            <div className="toggle-label">Dark</div>
          </div>

          <div className="theme-picker">
            {Object.keys(THEME_COLORS).map(key => (
              <button
                key={key}
                className={`theme-swatch ${themeColor===key ? "selected":""}`}
                style={{ background: THEME_COLORS[key] }}
                onClick={() => setThemeColor(key)}
                title={key}
              />
            ))}
          </div>

          <button className="btn-logout-sidebar" onClick={() => { localStorage.removeItem("studentToken");
localStorage.removeItem("student");
navigate("/student-login");
 localStorage.removeItem("student"); navigate("/student-login"); }}>🚪 Logout</button>
        </div>

        <div className="sd-footer muted small">Theme saved in browser • Demo mode</div>
      </aside>

      {/* Main */}
      <main className="sd-main glass">
        {/* Header */}
        <header className="sd-header" style={{ borderBottomColor: accentColor }}>
          <div className="sd-header-left">
            <h2 style={{ color: accentColor }}>{page.toUpperCase()}</h2>
            <div className="sd-search-note">Welcome, {student.name}</div>
          </div>
          <div className="sd-header-right">
            <div className="sd-actions">
            
    {/* ---------- 🏠 HOME BUTTON ---------- */}
    <button
      className="icon-btn"
      title="Go to Home"
      onClick={() => navigate("/")}   // This redirects to Main.jsx ("/" route)
    >
      🏠HOME
    </button>


              {/* ---------- Notifications ---------- */}
{/* ---------- Notifications ---------- */}
<div className={`notif-wrap ${notifOpen ? "open" : ""}`} ref={notifRef}>
  <button
    className="icon-btn"
    onClick={(e) => {
      e.stopPropagation();
      setNotifOpen((prev) => !prev);
    }}
  >
    🔔
    {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
  </button>

  {notifOpen && (
    <div className="notif-dropdown">
      <div className="notif-head">
        <strong>Notifications</strong>
        <button
          className="small ghost"
          onClick={(e) => {
            e.stopPropagation();
            markAllRead();
          }}
        >
          Mark all read
        </button>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="muted">No notifications</div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n._id || `${n.title}-${i}`}
              className={`notif-item ${n.read ? "read" : "unread"}`}
            >
              <div className="notif-title">{n.title}</div>
              <div className="notif-text muted">{n.text}</div>
              <div className="notif-meta muted small">
                {new Date(n.when).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>

{/* ---------- Chat Icon ---------- */}
<button
  className="icon-btn"
  title="Open Chat"
  onClick={() => setChatOpen((prev) => !prev)}
>
  💬
</button>

            </div>

            <div className="sd-user">
              <div className="avatar-sm" style={{ background: shadeColor(accentColor, -8) }}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="sd-user-info">
                <div className="sd-user-name">{student.name}</div>
                <div className="sd-user-email muted">{student.email}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="sd-content">
          {/* PROFILE */}
          {page === "profile" && (
            <section className="card-grid">
              <div className="card profile-card glass">
                <div className="profile-top">
                  <div className="profile-avatar-large" style={{ background: shadeColor(accentColor, -8) }}>
  {student.photo ? (
    <img src={student.photo} alt="avatar" />
  ) : (
    student.name.charAt(0).toUpperCase()
  )}

  {/* ⭐ NEW EDIT BUTTON AT TOP-RIGHT */}
  <label className="avatar-edit-btn">
    <input
      type="file"
      accept="image/*"
      onChange={ev => {
        const f = ev.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          const url = r.result;
          setStudent(s => {
            const upd = { ...s, photo: url };
            localStorage.setItem("student", JSON.stringify(upd));
            return upd;
          });
        };
        r.readAsDataURL(f);
      }}
    />
    ✎
  </label>
</div>

                  <div>
                    <h3>{student.name}</h3>
                    <p className="muted">{student.email}</p>
                  </div>
                </div>

                {!isEditing ? (
                  <>
                    <div className="profile-details-grid">
                      <div><strong>Phone</strong><div className="muted">{student.phone || "Not provided"}</div></div>
                      <div><strong>Branch</strong><div className="muted">{student.branch || "N/A"}</div></div>
                      <div><strong>Year</strong><div className="muted">{student.year || "N/A"}</div></div>
                      <div><strong>CGPA</strong><div className="muted">{student.cgpa || "N/A"}</div></div>
                      <div className="full"><strong>Skills</strong><div className="muted">{student.skills || "No skills"}</div></div>
                      {student.bio && <div className="full"><strong>Bio</strong><div className="muted">{student.bio}</div></div>}
                    </div>

                    <div className="actions-row">
                      <button className="btn" onClick={() => setIsEditing(true)} style={{ background: accentColor }}>✏️ Edit Profile</button>
                      <button className="btn ghost" onClick={() => { localStorage.removeItem("student"); localStorage.removeItem("studentToken");
localStorage.removeItem("student");
navigate("/student-login");
 navigate("/student-login"); }}>Switch Account</button>
                      <button className="btn" onClick={() => exportResume()}>🧾 Export Resume</button>
                    </div>
                  </>
                ) : (
                  <form className="profile-form-modern" onSubmit={handleUpdateProfile}>
                    <div className="form-row">
                      <label>Full Name</label>
                      <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                    </div>
                    <div className="form-row">
                      <label>Email</label>
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
                    </div>
                    <div className="form-row">
                      <label>Phone</label>
                      <input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                    <div className="form-row">
                      <label>Branch</label>
                      <select value={editForm.branch} onChange={(e) => setEditForm({...editForm, branch: e.target.value})} required>
                        <option value="">Select Branch</option>
                        <option>Computer Science</option>
                        <option>IT</option>
                        <option>AIML</option>
                        <option>Electronics</option>
                        <option>Mechanical</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Year</label>
                      <select value={editForm.year} onChange={(e) => setEditForm({...editForm, year: e.target.value})} required>
                        <option value="">Select Year</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>CGPA</label>
                      <input type="number" min="0" max="10" step="0.01" value={editForm.cgpa} onChange={(e) => setEditForm({...editForm, cgpa: e.target.value})} required />
                    </div>
                    <div className="form-row full">
                      <label>Skills</label>
                      <input placeholder="React, Node, Python" value={editForm.skills} onChange={(e)=>setEditForm({...editForm, skills: e.target.value})} />
                    </div>
                    <div className="form-row full">
                      <label>Bio</label>
                      <textarea rows="3" value={editForm.bio} onChange={(e)=>setEditForm({...editForm, bio: e.target.value})} />
                    </div>
                    <div className="actions-row">
                      <button className="btn" style={{ background: accentColor }} type="submit">💾 Save</button>
                      <button className="btn ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card glass">
                <h4>Quick Stats</h4>
                <div className="stat-row">
                  <div className="stat">
                    <div className="stat-num">{applications.length}</div>
                    <div className="muted">Total Applications</div>
                  </div>
                  <div className="stat">
                    <div className="stat-num">{drives.filter(d=>d.status==="Open").length}</div>
                    <div className="muted">Open Drives</div>
                  </div>
                  <div className="stat">
                    <div className="stat-num">{(student.cgpa)||"N/A"}</div>
                    <div className="muted">Your CGPA</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <h5>Application Breakdown</h5>
                  <SmallDonut stats={{
                    Applied: applications.length,
                    Accepted: applications.filter(a=>a.status==="Accepted"||a.status==="Placed").length,
                    Rejected: applications.filter(a=>a.status==="Rejected").length
                  }} />
                </div>
              </div>
            </section>
          )}

{page === "drives" && (
  <div className="drives-main-section">
    <div className="drives-layout">
      {/* SIDEBAR - Available Drives/Filters */}
      <div className="drives-sidebar glass">
        <h2 className="section-title">Available Drives</h2>
        <div className="drive-filter-row">
          <input
            className="drive-filter"
            placeholder="Search company, role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="drive-filter"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="SWE">SWE</option>
            <option value="Intern">Intern</option>
          </select>
          <input
            className="drive-filter"
            placeholder="Min eligible CGPA"
            type="number"
            step="0.1"
            value={filterEligibleCGPA}
            onChange={e => setFilterEligibleCGPA(e.target.value)}
          />
          <button
            className="btn ghost"
            onClick={() => {
              setSearchTerm("");
              setFilterRole("");
              setFilterEligibleCGPA("");
            }}
          >
            Clear
          </button>
          <button className="btn" onClick={fetchDrives}>🔄 Refresh</button>
        </div>
      </div>


     

    {/* CARD GRID - All drives as cards */}
   {/* CARD GRID - All drives as cards */}
<div className="drives-card-grid">
  {filteredDrives.length === 0 ? (
    <div className="empty-state">No drives available</div>
  ) : (
    filteredDrives.map((d) => (
      <div key={d._id} className="drive-card glass">
        <div className="drive-card-header">
          <span className="drive-company">{d.company}</span>
          <span className="role">{d.role}</span>
          <span className="drive-mode">{d.location || "Remote"}</span>
        </div>

        <div className="drive-description">
          <span className="muted tiny">{d.description}</span>
        </div>

        <div className="drive-info-row">
          <span className="muted small">
            {d.package ? d.package : "Package —"}
          </span>
          <span className="muted small">
            {d.date ? new Date(d.date).toLocaleDateString() : ""}
          </span>
        </div>

        <div className="drive-actions-row">
          {isAlreadyApplied(d._id) ? (
            <button className="btn applied" disabled>
              {getApplicationStatus(d._id) || "Applied"}
            </button>
          ) : d.status === "Closed" ? (
            <button className="btn ghost" disabled>
              Closed
            </button>
          ) : (
            <>
              <button className="btn" onClick={() => handleApply(d._id)}>
                Apply
              </button>
              <div className="slot-row">
                {d.slots &&
                  d.slots.map((slot) => (
                    <button
                      key={`${d._id}-${slot}`}
                      className="btn small"
                      onClick={() => handleBookSlot(d._id, slot)}
                    >
                      {slot}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    ))
  )}
</div>

  </div>
    </div>
)}

{/* UPLOAD DOCUMENTS */}
{page === "uploadDocs" && (
  <section className="card-grid">
    <div className="card wide glass">
      <h3>Upload Documents</h3>
      <p className="muted small">
        Upload your verified documents like Marksheet, ID Proof, Certificate, or Offer Letter.
      </p>

      {/* Document Upload Form */}
      <div className="doc-upload-form">

        {/* Document Type */}
        <div className="doc-row">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="doc-type-select"
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Certificate Title */}
        <input
          type="text"
          placeholder="Certificate Title"
          value={certificateTitle}
          onChange={(e) => setCertificateTitle(e.target.value)}
          className="doc-input"
        />

        {/* Certificate Issuer */}
        <input
          type="text"
          placeholder="Issued By (Organization)"
          value={certificateIssuer}
          onChange={(e) => setCertificateIssuer(e.target.value)}
          className="doc-input"
        />

        {/* Certificate Date */}
        <input
          type="date"
          value={certificateDate}
          onChange={(e) => setCertificateDate(e.target.value)}
          className="doc-input"
        />

        {/* File Upload */}
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        {/* Submit Button */}
        <button
          className="btn filled"
          onClick={handleFileUpload}
          style={{ marginTop: "10px" }}
        >
          {uploading ? "Uploading..." : "Submit Document"}
        </button>

      </div>

      <table className="doc-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {uploadedDocs.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="muted"
                style={{ textAlign: "center", padding: "16px", opacity: 0.7 }}
              >
                No documents uploaded yet.
              </td>
            </tr>
          ) : (
            uploadedDocs.map((d, index) => (
              <tr key={d._id || index}>
                <td>{d.type}</td>
                <td>{d.name}</td>
                <td className="muted small">
                  {d.uploadedAt
                    ? new Date(d.uploadedAt).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <span className={`doc-status ${d.status?.toLowerCase() || ""}`}>
                    {d.status || "Pending"}
                  </span>
                </td>
                <td>
                  <a
                    className="btn small ghost"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
)}



{/* APPLICATIONS */}
{page === "applications" && (
  <section className="applications-section">
    <h3 className="apps-title">My Applications</h3>

    <button
      className="btn ghost"
      onClick={() => fetchApplications(student._id)}
    >
      🔄 Refresh
    </button>

    {applications.length === 0 ? (
      <div className="empty-state">No applications yet</div>
    ) : (
      <div className="applications-table-wrapper">
        <table className="applications-table-modern">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Offer</th>
            </tr>
          </thead>

         <tbody>
  {applications.map((a, i) => (
    <tr key={a._id || a.driveId || `${a.company}-${a.role}-${i}`}>
      <td>{a.company || a.companyName || "—"}</td>
      <td>{a.jobRole || a.role || "—"}</td>
      <td>
        {a.appliedOn
          ? new Date(a.appliedOn).toLocaleDateString()
          : "—"}
      </td>
      <td>
        <span
          className={`status-badge ${a.status ? a.status.toLowerCase() : ""}`}
        >
          {a.status || "Pending"}
        </span>
      </td>
      <td>
        {a.status &&
        ["placed", "accepted"].includes(a.status.toLowerCase()) ? (
          <button
            className="btn small"
            onClick={() => generateOfferLetter(a)}
          >
            Download
          </button>
        ) : (
          <span className="muted small">—</span>
        )}
      </td>
    </tr>
  ))}
</tbody>


        </table>
      </div>
    )}
  </section>
)}



          {/* ANALYTICS */}
          {page === "analytics" && (
            <section className="card-grid">
              <div className="card glass">
                <h4>Application Status</h4>
                <SmallDonut stats={{
                  Applied: applications.length,
                  Accepted: applications.filter(a=>a.status==="Accepted"||a.status==="Placed").length,
                  Rejected: applications.filter(a=>a.status==="Rejected").length
                }} size={140} />
              </div>

              <div className="card wide glass">
                <h4>Top Companies (Placed)</h4>
                {analytics.topCompanies.length === 0 ? <p className="muted">No placed records yet</p> : <BarChart items={analytics.topCompanies} height={140} />}
              </div>

              <div className="card glass">
                <h4>Summary</h4>
                <ul className="muted">
                  <li>Total applications: {applications.length}</li>
                  <li>Open drives: {drives.filter(d=>d.status==="Open").length}</li>
                  <li>Accepted/Placed: {applications.filter(a=>a.status==="Accepted"||a.status==="Placed").length}</li>
                </ul>
              </div>
            </section>
          )}


          {/* CALENDAR */}
          {page==="calendar" && (
            <section className="card-grid">
              <div className="card wide glass">
                <h3>Your Interview Schedule</h3>
                <div className="calendar-list">
                  {calendar.length===0 ? <div className="muted">No scheduled interviews</div> : calendar.map(ev => (
                    <div key={ev._id} className="calendar-item">
                      <div><strong>{ev.company}</strong> — {ev.slot || ""}</div>
                      <div className="muted small">{new Date(ev.date).toLocaleString()} • {ev.status}</div>
                      <div className="calendar-actions">
                        <button className="btn small" onClick={() => window.open("https://calendar.google.com")}>Sync to Google</button>
                        <button className="btn small ghost" onClick={() => { setCalendar(prev=>prev.filter(x=>x._id!==ev._id)); pushNotification({ title: "Interview canceled", text: `Canceled ${ev.company}` }); }}>Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* RESUME BUILDER */}
          {page==="resume" && (
            <section className="card-grid">
              <div className="card wide glass">
                <h3>Resume Builder</h3>
                <p className="muted">Auto-generate a printable resume from your profile.</p>
                <div className="resume-actions">
                  <button className="btn" onClick={() => exportResume()} style={{ background: accentColor }}>Export / Print</button>
                  <button className="btn ghost" onClick={() => alert("Templates: Classic, Modern, Minimal — coming soon!")}>Choose Template</button>
                </div>
              </div>
            </section>
          )}

          {/* PREPARATION */}
          {page==="preparation" && (
            <section className="card-grid">
              <div className="card wide glass">
                <h3>Preparation Center</h3>
                <ul>
                  {PREP_LINKS.map((link,i)=>
                    <li key={i}><a href={link.url} target="_blank" rel="noreferrer">{link.title}</a></li>
                  )}
                </ul>
              </div>
            </section>
          )}

          {/* FEEDBACK */}
          {page==="feedback" && (
            <section className="card-grid">
              <div className="card wide glass">
                <h3>Share Feedback</h3>
                <textarea rows={4} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Share feedback about placement process, interviews, material etc." />
                <div className="actions-row" style={{ marginTop: 12 }}>
                  <button className="btn" onClick={handleFeedback} style={{ background: accentColor }}>Submit</button>
                  <button className="btn ghost" onClick={() => { setFeedback(""); }}>Clear</button>
                </div>

                <h4 style={{ marginTop: 14 }}>Your feedbacks (local)</h4>
                <ul>
  {feedbacks.map(fb => (
    <li key={fb._id || fb.tempId}>
      {fb.text}
      <span className="muted small">
        {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
      </span>
    </li>
  ))}
</ul>

              </div>
            </section>
          )}

        </div>
      </main>

      {/* Chat widget */}
      <div className={`chat-widget ${chatOpen ? "open" : ""}`}>
        <div className="chat-header">
          <strong>Placement Chat</strong>
          <button className="small ghost" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        <div className="chat-messages">
         {messages.map((m) => (
  <div key={m.id || `${m.from}-${m.at}`} className={`chat-msg ${m.from === "me" ? "me" : "admin"}`}>
    <div className="chat-text">{m.text}</div>
    <div className="chat-time muted small">{new Date(m.at).toLocaleString()}</div>
  </div>
))}

        </div>
        <div className="chat-input">
          <input placeholder="Type a message..." value={messageText} onChange={e=>setMessageText(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendMessage(messageText); }} />
          <button className="btn small" onClick={() => sendMessage(messageText)}>Send</button>
        </div>
      </div>

      {/* Help Bot drawer */}
      <div className={`help-drawer ${helpOpen ? "open" : ""}`}>
  <div className="help-head">
    <strong>Placement Assistant</strong>
    <button className="small ghost" onClick={() => setHelpOpen(false)}>✕</button>
  </div>

  <div className="help-body">
    {botHistory.map((b) => (
      <div
        key={`${b.from}-${b.at || Date.now()}-${Math.random()}`}
        className={`bot-item ${b.from === "bot" ? "bot" : "user"}`}
      >
        <div className="bot-text">{b.text}</div>
      </div>
    ))}
  </div>

  <div className="help-input">
    <input
      placeholder="Ask the assistant..."
      value={botInput}
      onChange={(e) => setBotInput(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") sendBot(); }}
    />
    <button className="btn small" onClick={sendBot}>Ask</button>
  </div>
</div>

    </div>      
  );
}
