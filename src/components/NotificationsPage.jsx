import React, { useEffect, useState } from "react";
import "./NotificationPage.css";

const API = process.env.REACT_APP_API_URL;

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Notification Fetch Error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="notifications-page">
      <h1>All Notifications</h1>

      {loading ? (
        <p className="notifications-loading">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="notifications-empty">No notifications found.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n, i) => (
            <li key={i} className="notification-card">
              <span className="notification-icon">📢</span>

              <div className="notification-body">
                <p>{n.message}</p>

                <span className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPage;
