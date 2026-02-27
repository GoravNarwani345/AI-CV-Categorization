import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { FaTimes, FaCommentAlt } from 'react-icons/fa';

const ChatPopup = ({ onOpenChat }) => {
    const { incomingMessage, clearIncomingMessage } = useSocket();
    const [visible, setVisible] = useState(false);
    const [messageData, setMessageData] = useState(null);

    useEffect(() => {
        if (incomingMessage) {
            setMessageData(incomingMessage);
            setVisible(true);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(clearIncomingMessage, 300); // Clear after fade out
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [incomingMessage, clearIncomingMessage]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(clearIncomingMessage, 300);
    };

    const handleReply = () => {
        if (messageData) {
            onOpenChat(messageData.conversationId);
            handleClose();
        }
    };

    if (!messageData || !visible) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white rounded-xl shadow-2xl border border-blue-100 p-4 w-72 md:w-80">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <FaCommentAlt />
                        <span>New Message</span>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="font-bold text-gray-800 text-sm">{messageData.message.sender.name}</p>
                    <p className="text-gray-600 text-sm truncate">{messageData.message.content}</p>
                </div>

                <button
                    onClick={handleReply}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                    Reply
                </button>
            </div>
        </div>
    );
};

export default ChatPopup;
