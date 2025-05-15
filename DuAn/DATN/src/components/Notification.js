import React, { useEffect, useState } from 'react';
import './Notification.css';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Notification = ({ type = 'info', title, message, duration = 3000, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle />;
            case 'error':
                return <FaTimesCircle />;
            default:
                return <FaInfoCircle />;
        }
    };

    return (
        <div className={`notification ${type} ${isClosing ? 'slideOut' : ''}`}>
            <div className="notification-icon">
                {getIcon()}
            </div>
            <div className="notification-content">
                {title && <div className="notification-title">{title}</div>}
                {message && <div className="notification-message">{message}</div>}
            </div>
            <button className="notification-close" onClick={handleClose}>
                <FaTimes />
            </button>
        </div>
    );
};

export default Notification; 