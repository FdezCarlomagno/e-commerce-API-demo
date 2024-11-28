const express = require('express')
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');


//Only logged in routes
router.get('/', isAuthenticated, cartController.getUserCart);
router.post('/addToCart', isAuthenticated, cartController.addToCart);
router.get('/products', isAuthenticated, cartController.getCartProducts);
router.put('/addToCart', isAuthenticated, cartController.updateCartItemQuantity);
router.delete('/products', isAuthenticated, cartController.deleteCartItem);

module.exports = router;