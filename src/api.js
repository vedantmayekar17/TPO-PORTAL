const API_URL = "http://localhost:5000/api";

/* ======================================================
   ✅ AUTH / LOGIN
====================================================== */
export const adminLogin = async (identifier, password) => {
  const res = await fetch(`${API_URL}/admins/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return res.json();
};

export const studentLogin = async (roll, password) => {
  const res = await fetch(`${API_URL}/students/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roll, password }),
  });
  return res.json();
};

/* ======================================================
   ✅ DRIVES
====================================================== */
export const getDrives = async () => {
  const res = await fetch(`${API_URL}/drives`);
  return res.json();
};

export const addDrive = async (data, token) => {
  const res = await fetch(`${API_URL}/drives`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

/* ======================================================
   ✅ APPLICATIONS
====================================================== */
export const getApplications = async (studentId) => {
  const res = await fetch(`${API_URL}/applications?studentId=${studentId}`);
  return res.json();
};

/* ======================================================
   ✅ FEEDBACKS
====================================================== */
export const sendFeedback = async (studentId, text, token) => {
  const res = await fetch(`${API_URL}/feedbacks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, text }),
  });
  return res.json();
};

export const getFeedbacks = async (token) => {
  const res = await fetch(`${API_URL}/feedbacks`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

/* ======================================================
   ✅ NOTIFICATIONS
====================================================== */
export const sendNotification = async (message, target, token) => {
  const res = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ message, target }),
  });
  return res.json();
};

export const getNotifications = async (token) => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

/* ======================================================
   ✅ GENERIC AUTH FETCH WRAPPER
====================================================== */
export const fetchWithAuth = (endpoint, options = {}) => {
  const token = localStorage.getItem("studentToken");

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });
};
