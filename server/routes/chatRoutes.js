const express = require('express');
const {
  getChats,
  saveChat,
  deleteChat,
  toggleChatFavourite
} = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All chat routes are protected
router.use(verifyToken);

router.get('/', getChats);
router.post('/', saveChat);
router.delete('/:id', deleteChat);
router.patch('/:id/favourite', toggleChatFavourite);

module.exports = router;
