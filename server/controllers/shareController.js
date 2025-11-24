const Template = require('../models/Template');
const { sendTemplateShareEmail } = require('../utils/emailService');
const { exportToHTML } = require('../utils/htmlExport');

/**
 * Share template via email
 */
const shareTemplate = async (req, res) => {
  try {
    const { templateId, recipientEmail } = req.body;

    if (!templateId || !recipientEmail) {
      return res.status(400).json({ message: 'Template ID and recipient email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find template
    const template = await Template.findOne({
      _id: templateId,
      userId: req.userId
    }).populate('userId', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Generate HTML from template blocks
    const templateHTML = exportToHTML(template.blocks);

    // Send email
    const result = await sendTemplateShareEmail(
      recipientEmail,
      template.userId.name,
      template.name,
      templateHTML
    );

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to send email', error: result.error });
    }

    res.json({ 
      message: 'Template shared successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Share template error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  shareTemplate
};
