const express = require('express');
const {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  toggleFavourite
} = require('../controllers/templateController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.put('/:id', updateTemplate);
router.patch('/:id/favourite', toggleFavourite);
router.delete('/:id', deleteTemplate);

module.exports = router;
