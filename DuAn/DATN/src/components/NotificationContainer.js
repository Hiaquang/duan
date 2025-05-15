import React, { useState, useEffect } from 'react';
import './NotificationContainer.css';

let showNotificationFunction = null;

export const showNotification = ({ type, title, message }) => {
    if (showNotificationFunction) {
        showNotificationFunction({ type, title, message });
    } else {
        console.error('NotificationContainer chưa được khởi tạo');
    }
};

const NotificationContainer = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        showNotificationFunction = ({ type, title, message }) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, type, title, message }]);
            
            // Tự động xóa thông báo sau 3 giây
            setTimeout(() => {
                setNotifications(prev => prev.filter(notification => notification.id !== id));
            }, 3000);
        };

        return () => {
            showNotificationFunction = null;
        };
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-times-circle';
            case 'warning':
                return 'fas fa-exclamation-circle';
            case 'info':
                return 'fas fa-info-circle';
            default:
                return 'fas fa-bell';
        }
    };

    return (
        <div className="notification-container">
            {notifications.map(notification => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    <div className="notification-icon">
                        <i className={getIcon(notification.type)}></i>
                    </div>
                    <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                    </div>
                    <button 
                        className="notification-close"
                        onClick={() => removeNotification(notification.id)}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer; 