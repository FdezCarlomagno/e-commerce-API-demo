const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// llega como /products

router.get('/', productController.getProducts);
router.get('/:product_id', productController.getProductByID);

// admin routes

router.post('/', isAuthenticated, isAdmin, productController.addProduct);
router.delete('/:product_id', isAuthenticated, isAdmin, productController.deleteProduct);
router.put('/:product_id', isAuthenticated, isAdmin, productController.updateProduct);

module.exports = router;