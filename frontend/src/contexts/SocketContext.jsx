import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [incomingMessage, setIncomingMessage] = useState(null);
    const { user } = useAuth();
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

    const requestNotificationPermission = useCallback(async () => {
        console.log('🔔 Checking notification permission...');
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }

        console.log('🔔 Current permission:', Notification.permission);
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            console.log('🔔 New permission result:', permission);
            setNotificationPermission(permission);
        }
    }, []);

    useEffect(() => {
        if (user) {
            requestNotificationPermission();
        }
    }, [user, requestNotificationPermission]);

    useEffect(() => {
        if (user && user.uid) {
            const newSocket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('🔌 Connected to socket server');
                newSocket.emit('join', user.uid);
            });

            newSocket.on('new_message', (data) => {
                console.log('📩 New message received:', data);
                setIncomingMessage(data);

                // Browser notification
                console.log('🔔 Notification check - Permission:', Notification.permission, 'Hidden:', document.hidden);
                if (Notification.permission === 'granted') {
                    try {
                        new Notification('New Message', {
                            body: `${data.senderName || 'Someone'} sent you a message`,
                            icon: '/favicon.ico' // More likely to exist than logo192
                        });
                        console.log('🔔 Browser notification triggered');
                    } catch (err) {
                        console.error('🔔 Error creating notification:', err);
                    }
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
                console.log('🔌 Disconnected from socket server');
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [user, SOCKET_URL]);

    const clearIncomingMessage = useCallback(() => {
        setIncomingMessage(null);
    }, []);

    const value = {
        socket,
        incomingMessage,
        clearIncomingMessage
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
