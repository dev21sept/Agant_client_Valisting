const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');

router.post('/products', auth, productController.createProduct);
router.get('/products', auth, productController.getAllProducts);
router.get('/products/:id', auth, productController.getProduct);
router.put('/products/:id', auth, productController.updateProduct);
router.delete('/products/:id', auth, productController.deleteProduct);

module.exports = router;
