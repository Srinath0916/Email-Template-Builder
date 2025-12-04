const Favourite = require('../models/Favourite');
const Template = require('../models/Template');

/**
 * Get all favourites for current user
 */
const getFavourites = async (req, res) => {
  try {
    const { type } = req.query; // 'template' or 'chat' or undefined (all)

    const query = { userId: req.userId };
    
    if (type && ['template', 'chat'].includes(type)) {
      query.itemType = type;
    }

    const favourites = await Favourite.find(query)
      .sort({ createdAt: -1 })
      .populate('itemId');

    res.json({ favourites });
  } catch (error) {
    console.error('Get favourites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Toggle favourite (add or remove)
 */
const toggleFavourite = async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'itemType and itemId are required' });
    }

    if (!['template', 'chat'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }

    // Check if item exists and belongs to user
    let item;
    if (itemType === 'template') {
      item = await Template.findOne({ _id: itemId, userId: req.userId });
    }

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if already favourited
    const existing = await Favourite.findOne({
      userId: req.userId,
      itemType,
      itemId
    });

    if (existing) {
      // Remove from favourites
      await Favourite.deleteOne({ _id: existing._id });
      
      // Update item's isFavourite flag
      item.isFavourite = false;
      await item.save();

      return res.json({ 
        message: 'Removed from favourites',
        isFavourite: false
      });
    } else {
      // Add to favourites
      const favourite = new Favourite({
        userId: req.userId,
        itemType,
        itemId
      });

      await favourite.save();

      // Update item's isFavourite flag
      item.isFavourite = true;
      await item.save();

      return res.json({ 
        message: 'Added to favourites',
        isFavourite: true,
        favourite
      });
    }
  } catch (error) {
    console.error('Toggle favourite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Remove favourite
 */
const removeFavourite = async (req, res) => {
  try {
    const { id } = req.params;

    const favourite = await Favourite.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!favourite) {
      return res.status(404).json({ message: 'Favourite not found' });
    }

    // Update item's isFavourite flag
    let item;
    if (favourite.itemType === 'template') {
      item = await Template.findById(favourite.itemId);
    }

    if (item) {
      item.isFavourite = false;
      await item.save();
    }

    res.json({ message: 'Removed from favourites' });
  } catch (error) {
    console.error('Remove favourite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getFavourites,
  toggleFavourite,
  removeFavourite
};
