import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCircle, FaUser, FaClock, FaCheckDouble } from 'react-icons/fa';
import { useSocket } from '../contexts/SocketContext';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const loadNotifications = async () => {
            const result = await fetchNotifications();
            if (result.success) {
                setNotifications(result.data);
                setUnreadCount(result.data.filter(n => !n.isRead).length);
            }
        };
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', ({ notification }) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.off('new_notification');
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleMarkRead = async (id) => {
        const result = await markNotificationRead(id);
        if (result.success) {
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllRead = async () => {
        const result = await markAllNotificationsRead();
        if (result.success) {
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2 text-gray-600 hover:text-blue-600 transition relative"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <FaCheckDouble /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                                    className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer transition ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className={`p-2 rounded-full h-fit ${notif.type === 'application' ? 'bg-blue-100 text-blue-600' :
                                            notif.type === 'status_update' ? 'bg-green-100 text-green-600' :
                                                'bg-purple-100 text-purple-600'
                                        }`}>
                                        {notif.type === 'application' ? <FaUser size={12} /> : <FaBell size={12} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {notif.content}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <FaClock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!notif.isRead && <FaCircle size={8} className="text-blue-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <FaBell className="mx-auto text-3xl mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                        <button className="text-xs text-gray-500 hover:text-blue-600 font-medium">
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
