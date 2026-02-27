import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Socket Initialization
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Auth Check & Socket Connection
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const result = await response.json();
                    if (result.success) {
                        setUser(result.user);
                        if (socket) {
                            socket.connect();
                            socket.emit('join', result.user.id || result.user._id);
                        }
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('uid');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [socket]);

    // Global Socket Listeners
    useEffect(() => {
        if (!socket || !user) return;

        socket.on('new_application', (data) => {
            toast.info(`🚀 New application for "${data.jobTitle}"!`, {
                position: "top-right",
                autoClose: 5000
            });
        });

        socket.on('application_status_updated', (data) => {
            toast.success(`📝 Your application status has been updated to: ${data.status}!`, {
                position: "top-right",
                autoClose: 5000
            });
        });

        socket.on('new_message', (data) => {
            toast.info(`💬 New message from ${data.message.sender.name}`, {
                position: "bottom-left"
            });
        });

        return () => {
            socket.off('new_application');
            socket.off('application_status_updated');
            socket.off('new_message');
        };
    }, [socket, user]);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('uid', userData.uid || userData.id || userData._id);
        if (socket) {
            socket.connect();
            socket.emit('join', userData.id || userData._id);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        if (socket) socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, loading, socket, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
