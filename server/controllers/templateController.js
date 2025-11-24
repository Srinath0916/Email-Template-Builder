const Template = require('../models/Template');

const createTemplate = async (req, res) => {
  try {
    const { name, blocks } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    const template = new Template({
      userId: req.userId,
      name,
      blocks: blocks || []
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { name, blocks } = req.body;

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, blocks },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
};
