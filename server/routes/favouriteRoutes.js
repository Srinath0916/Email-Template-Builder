const express = require('express');
const {
  getFavourites,
  toggleFavourite,
  removeFavourite
} = require('../controllers/favouriteController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All favourite routes are protected
router.use(verifyToken);

router.get('/', getFavourites);
router.post('/', toggleFavourite);
router.delete('/:id', removeFavourite);

module.exports = router;
