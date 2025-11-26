const Template = require('../models/Template');

// Get all templates for user
exports.getTemplates = async (req, res) => {
  try {
    const { favouritesOnly } = req.query;
    const query = { userId: req.userId };
    
    if (favouritesOnly === 'true') {
      query.isFavourite = true;
    }

    const templates = await Template.find(query)
      .sort({ lastModified: -1 })
      .select('-__v');

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single template
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create template
exports.createTemplate = async (req, res) => {
  try {
    const { name, blocks, globalStyles } = req.body;

    const template = new Template({
      name,
      userId: req.userId,
      blocks: blocks || [],
      globalStyles: globalStyles || {}
    });

    await template.save();
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { name, blocks, globalStyles } = req.body;

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, blocks, globalStyles, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Toggle favourite
exports.toggleFavourite = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    template.isFavourite = !template.isFavourite;
    await template.save();

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
