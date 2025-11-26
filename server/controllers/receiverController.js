const ReceivedTemplate = require('../models/ReceivedTemplate');
const Template = require('../models/Template');
const User = require('../models/User');

// Send template to another user
exports.sendTemplate = async (req, res) => {
  try {
    const { templateId, receiverIdentifier, message } = req.body;
    const senderId = req.userId;

    if (!templateId || !receiverIdentifier) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template ID and receiver email/username are required' 
      });
    }

    // Find the template and verify ownership
    const template = await Template.findOne({ _id: templateId, userId: senderId });
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found or you do not have permission' 
      });
    }

    // Find receiver by email or name
    const receiver = await User.findOne({
      $or: [
        { email: receiverIdentifier },
        { name: receiverIdentifier }
      ]
    });

    if (!receiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receiver not found' 
      });
    }

    // Check if sending to self
    if (receiver._id.toString() === senderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send template to yourself' 
      });
    }

    // Create received template entry
    const receivedTemplate = new ReceivedTemplate({
      senderId,
      receiverId: receiver._id,
      templateId,
      message: message || '',
      status: 'unread'
    });

    await receivedTemplate.save();

    res.status(201).json({ 
      success: true, 
      message: 'Template sent successfully',
      receivedTemplate 
    });
  } catch (error) {
    console.error('Send template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all received templates for logged-in user
exports.getReceivedTemplates = async (req, res) => {
  try {
    const receiverId = req.userId;

    const receivedTemplates = await ReceivedTemplate.find({ receiverId })
      .populate('senderId', 'name email')
      .populate('templateId')
      .sort({ receivedAt: -1 });

    res.json({ 
      success: true, 
      receivedTemplates 
    });
  } catch (error) {
    console.error('Get received templates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Mark received template as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.userId;

    const receivedTemplate = await ReceivedTemplate.findOneAndUpdate(
      { _id: id, receiverId },
      { status: 'read' },
      { new: true }
    );

    if (!receivedTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Received template not found' 
      });
    }

    res.json({ 
      success: true, 
      receivedTemplate 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete received template
exports.deleteReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.userId;

    const receivedTemplate = await ReceivedTemplate.findOneAndDelete({
      _id: id,
      receiverId
    });

    if (!receivedTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Received template not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Received template deleted' 
    });
  } catch (error) {
    console.error('Delete received error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Save received template to user's own templates
exports.saveToMyTemplates = async (req, res) => {
  try {
    const { id } = req.params;
    const receiverId = req.userId;

    // Find the received template
    const receivedTemplate = await ReceivedTemplate.findOne({
      _id: id,
      receiverId
    }).populate('templateId');

    if (!receivedTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Received template not found' 
      });
    }

    const originalTemplate = receivedTemplate.templateId;

    // Create a copy of the template for the receiver
    const newTemplate = new Template({
      name: `${originalTemplate.name} (Copy)`,
      userId: receiverId,
      blocks: originalTemplate.blocks,
      globalStyles: originalTemplate.globalStyles
    });

    await newTemplate.save();

    res.status(201).json({ 
      success: true, 
      message: 'Template saved to your templates',
      template: newTemplate 
    });
  } catch (error) {
    console.error('Save to my templates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
