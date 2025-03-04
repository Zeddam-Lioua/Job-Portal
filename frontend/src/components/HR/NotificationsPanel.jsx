import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheck,
  faTimes,
  faBellSlash,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import hrService from "../../services/hr.service";
import "./styles/NotificationsPanel.css";

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevNotificationsRef = useRef([]); // Track previous notifications
  const audioRef = useRef(null); // Create audio element
  const panelRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Create audio element when component mounts
    audioRef.current = new Audio("/assets/notification.mp3");
    audioRef.current.preload = "auto"; // Preload the audio file
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!audioInitialized && audioRef.current) {
        try {
          // Load and initialize audio after user interaction
          audioRef.current.load();
          setAudioInitialized(true);

          // Remove the event listeners once initialized
          document.removeEventListener("click", handleUserInteraction);
          document.removeEventListener("keydown", handleUserInteraction);
          document.removeEventListener("touchstart", handleUserInteraction);
        } catch (error) {
          console.error("Error initializing audio:", error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      // Clean up event listeners and audio
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioInitialized]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      if (!audioInitialized || !audioRef.current) {
        return;
      }

      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing notification sound:", error);
        });
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await hrService.getNotifications();
      const newNotifications = response.data;

      // Check for new unread notifications
      const prevIds = prevNotificationsRef.current.map((n) => n.id);
      const hasNewNotification = newNotifications.some(
        (notif) => !prevIds.includes(notif.id) && !notif.is_read
      );

      if (hasNewNotification) {
        playNotificationSound();
        const bell = document.querySelector(".notifications-trigger");
        if (bell) {
          bell.classList.add("bell-shake");
          setTimeout(() => bell.classList.remove("bell-shake"), 1000);
        }
      }

      // Update previous notifications reference
      prevNotificationsRef.current = newNotifications;
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await hrService.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await hrService.deleteNotification(notificationId);
      setNotifications(
        notifications.filter((notif) => notif.id !== notificationId)
      );
      if (
        !notifications.find((notif) => notif.id === notificationId)?.is_read
      ) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);

      setTimeout(() => {
        const targetCard = document.querySelector(
          `[data-id="${notification.entity_id}"]`
        );
        if (targetCard) {
          targetCard.classList.add("highlighted-card");
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });

          const removeHighlight = () => {
            targetCard.classList.remove("highlighted-card");
            targetCard.classList.add("highlight-removed");
            targetCard.removeEventListener("mouseenter", removeHighlight);
          };
          targetCard.addEventListener("mouseenter", removeHighlight, {
            once: true,
          });
        }
      }, 300);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
      }
    }
    return "Just now";
  };

  const getSenderInfo = (notification) => {
    switch (notification.sender_type) {
      case "user":
        return {
          name: `${notification.sender_user?.first_name} ${notification.sender_user?.last_name}`,
          email: notification.sender_user?.email,
          profile_picture: notification.sender_user?.profile_picture,
        };
      case "applicant":
        return {
          name: notification.sender_name,
          email: notification.sender_email,
          profile_picture: null,
        };
      default:
        return {
          name: "System",
          email: null,
          profile_picture: null,
        };
    }
  };

  return (
    <div className="notifications-panel" ref={panelRef}>
      <button
        className="notifications-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="icon-wrapper">
          <FontAwesomeIcon icon={faBell} />
          <span
            className={`notification-badge ${unreadCount === 0 ? "empty" : ""}`}
          >
            {unreadCount}
          </span>
        </div>
        <span className="link-text">Notifications</span>
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <h3>Notifications</h3>
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <FontAwesomeIcon
                icon={faBellSlash}
                className="empty-notifications-icon"
              />
              <p className="empty-notifications-text">No notifications yet</p>
            </div>
          ) : (
            <ul className="notifications-list">
              {notifications.map((notification) => {
                const senderInfo = getSenderInfo(notification);
                return (
                  <li
                    key={notification.id}
                    className={`notification-item ${
                      !notification.is_read ? "unread" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <div className="notification-sender-avatar">
                        {notification.sender_type === "user" &&
                        notification.sender_user ? (
                          notification.sender_user.profile_picture ? (
                            <img
                              src={notification.sender_user.profile_picture}
                              alt={`${notification.sender_user.first_name} ${notification.sender_user.last_name}`}
                            />
                          ) : (
                            <FontAwesomeIcon icon={faUserCircle} />
                          )
                        ) : (
                          <FontAwesomeIcon icon={faUserCircle} />
                        )}
                      </div>
                      <div className="notification-message-wrapper">
                        <p className="notification-message">
                          <span className="notification-sender">
                            {notification.sender_type === "user" &&
                            notification.sender_user
                              ? `${notification.sender_user.first_name} ${notification.sender_user.last_name}`
                              : notification.sender_name || "System"}
                          </span>{" "}
                          {notification.message}
                        </p>
                        <span className="notification-time">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="action-button read"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="action-button delete"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
