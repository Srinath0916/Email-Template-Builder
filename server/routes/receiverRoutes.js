const express = require('express');
const {
  sendTemplate,
  getReceivedTemplates,
  markAsRead,
  deleteReceived,
  saveToMyTemplates
} = require('../controllers/receiverController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All receiver routes are protected
router.use(verifyToken);

router.post('/send-template', sendTemplate);
router.get('/received', getReceivedTemplates);
router.patch('/received/mark-read/:id', markAsRead);
router.delete('/received/:id', deleteReceived);
router.post('/received/save/:id', saveToMyTemplates);

module.exports = router;
