const ChatMessage = require('../models/ChatMessage');

/**
 * Get all chat messages for current user
 */
const getChats = async (req, res) => {
  try {
    const { limit = 50, skip = 0, favouritesOnly = false } = req.query;

    const query = { userId: req.userId };
    
    if (favouritesOnly === 'true') {
      query.isFavourite = true;
    }

    const chats = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ChatMessage.countDocuments(query);

    res.json({
      chats,
      total,
      hasMore: total > parseInt(skip) + chats.length
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Save a new chat message
 */
const saveChat = async (req, res) => {
  try {
    const { role, message, metadata } = req.body;

    if (!role || !message) {
      return res.status(400).json({ message: 'Role and message are required' });
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const chat = new ChatMessage({
      userId: req.userId,
      role,
      message,
      metadata: metadata || {},
      isFavourite: false
    });

    await chat.save();

    res.status(201).json({
      message: 'Chat saved successfully',
      chat
    });
  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a chat message
 */
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await ChatMessage.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Toggle favourite status of a chat message
 */
const toggleChatFavourite = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await ChatMessage.findOne({
      _id: id,
      userId: req.userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.isFavourite = !chat.isFavourite;
    await chat.save();

    res.json({
      message: chat.isFavourite ? 'Added to favourites' : 'Removed from favourites',
      chat
    });
  } catch (error) {
    console.error('Toggle chat favourite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getChats,
  saveChat,
  deleteChat,
  toggleChatFavourite
};
