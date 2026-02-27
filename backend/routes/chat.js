const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Create or find a conversation between 2 users
router.post('/conversations', auth, async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ success: false, error: 'Recipient ID is required' });
        }

        if (recipientId === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot message yourself' });
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, recipientId], $size: 2 }
        }).populate('participants', 'name email role').populate('lastMessage');

        if (conversation) {
            return res.json({ success: true, data: conversation, existing: true });
        }

        // Create new conversation
        conversation = new Conversation({
            participants: [req.user.id, recipientId]
        });
        await conversation.save();

        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name email role');

        res.status(201).json({ success: true, data: conversation, existing: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }

        // Check if user is part of the conversation
        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversation: req.params.id })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ conversation: req.params.id });

        res.json({
            success: true,
            data: messages,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Send a message
router.post('/messages', auth, async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({ success: false, error: 'Conversation ID and content are required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, error: 'Conversation not found' });
        }

        if (!conversation.participants.includes(req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Create the message
        let message = new Message({
            conversation: conversationId,
            sender: req.user.id,
            content: content.trim(),
            readBy: [req.user.id]
        });
        await message.save();

        // Update conversation's lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        // Populate sender info
        message = await Message.findById(message._id).populate('sender', 'name email');

        // Emit via Socket.io to the other participant
        const io = req.app.get('io');
        if (io) {
            const otherParticipants = conversation.participants.filter(
                p => p.toString() !== req.user.id
            );
            otherParticipants.forEach(participantId => {
                io.to(participantId.toString()).emit('new_message', {
                    message,
                    conversationId
                });
            });
        }

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Mark messages as read
router.put('/messages/read/:conversationId', auth, async (req, res) => {
    try {
        await Message.updateMany(
            {
                conversation: req.params.conversationId,
                readBy: { $ne: req.user.id }
            },
            { $addToSet: { readBy: req.user.id } }
        );

        // Notify other participants that messages were read
        const io = req.app.get('io');
        if (io) {
            const conversation = await Conversation.findById(req.params.conversationId);
            if (conversation) {
                const otherParticipants = conversation.participants.filter(
                    p => p.toString() !== req.user.id
                );
                otherParticipants.forEach(participantId => {
                    io.to(participantId.toString()).emit('messages_read', {
                        conversationId: req.params.conversationId,
                        readBy: req.user.id
                    });
                });
            }
        }

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id });
        const conversationIds = conversations.map(c => c._id);

        const unreadCount = await Message.countDocuments({
            conversation: { $in: conversationIds },
            readBy: { $ne: req.user.id },
            sender: { $ne: req.user.id }
        });

        res.json({ success: true, data: { unreadCount } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
