const Chat = require('../models/Chat');

// Get all chats for user
exports.getChats = async (req, res) => {
  try {
    const { favouritesOnly } = req.query;
    const query = { userId: req.user.id };
    
    if (favouritesOnly === 'true') {
      query.isFavourite = true;
    }

    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create chat message
exports.createChat = async (req, res) => {
  try {
    const { role, message, metadata } = req.body;

    const chat = new Chat({
      userId: req.user.id,
      role,
      message,
      metadata
    });

    await chat.save();
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Toggle favourite
exports.toggleFavourite = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.isFavourite = !chat.isFavourite;
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
