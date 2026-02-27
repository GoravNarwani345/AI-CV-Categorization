import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSearch, FaUser, FaCircle, FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Messaging = ({ initialConversationId }) => {
  const { user } = useAuth();
  const { socket, incomingMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setConversations(result.data);
        // If initialConversationId provided, select it
        if (initialConversationId) {
          const conv = result.data.find(c => c._id === initialConversationId);
          if (conv) setSelectedConversation(conv);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [initialConversationId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          setMessagesLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/chat/conversations/${selectedConversation._id}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (result.success) {
            setMessages(result.data);
            // Mark as read
            fetch(`${API_URL}/chat/messages/read/${selectedConversation._id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setMessagesLoading(false);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  // Handle incoming messages via socket
  useEffect(() => {
    if (incomingMessage) {
      const { message, conversationId } = incomingMessage;

      // If it's for the currently open conversation
      if (selectedConversation && conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        // Mark as read
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/chat/messages/read/${conversationId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Refresh conversation list to show unread or new message
        fetchConversations();
      }
    }
  }, [incomingMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: newMessage
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setNewMessage('');
        // Update conversation list last message
        setConversations(prev => prev.map(c =>
          c._id === selectedConversation._id ? { ...c, lastMessage: result.data } : c
        ));
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getOtherParticipant = (participants) => {
    return participants.find(p => p._id !== user.uid);
  };

  const filteredConversations = conversations.filter(c => {
    const other = getOtherParticipant(c.participants);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading conversations...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-md overflow-hidden animate-fade-in border border-gray-100">
      {/* Conversations List */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation.participants);
              const isSelected = selectedConversation?._id === conversation._id;
              const hasUnread = conversation.lastMessage &&
                conversation.lastMessage.sender !== user.uid &&
                !conversation.lastMessage.readBy.includes(user.uid);

              return (
                <div
                  key={conversation._id}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/50 border-r-2 border-r-blue-500' : ''
                    }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
                      {other?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-blue-700' : 'text-gray-900'}`}>
                          {other?.name}
                        </h3>
                        <span className="text-[10px] text-gray-400">
                          {conversation.updatedAt && new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${hasUnread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                        {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                    {hasUnread && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50/30 ${!selectedConversation ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-gray-500 p-1"
              >
                <FaChevronLeft />
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {getOtherParticipant(selectedConversation.participants)?.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 leading-none mb-1">
                  {getOtherParticipant(selectedConversation.participants)?.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">
                    {getOtherParticipant(selectedConversation.participants)?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center py-4 text-gray-400 text-xs italic">Loading messages...</div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender._id === user.uid || msg.sender === user.uid;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine
                          ? 'bg-blue-600 text-white rounded-br-none shadow-blue-100'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-100 shadow-sm'
                        } shadow-sm transition-all hover:shadow-md`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:scale-95 active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-blue-300 text-3xl" />
            </div>
            <h3 className="text-gray-800 font-bold mb-1">Your Messages</h3>
            <p className="text-gray-500 text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
