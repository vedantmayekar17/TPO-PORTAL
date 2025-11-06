const API_URL = "http://localhost:5000/api";

export const adminLogin = async (username, password) => {
  const res = await fetch(`${API_URL}/adminLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
};

export const getDrives = async () => {
  const res = await fetch(`${API_URL}/drives`);
  return res.json();
};

export const addDrive = async (data) => {
  const res = await fetch(`${API_URL}/drives/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};
export const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }
  });
};
