const express = require('express');
const router = express.Router();
const productController = require('../controllers/agent_tools_controller');
const { agentAuth } = require('../middleware/agent_auth');

router.post('/products', agentAuth, productController.createProduct);
router.get('/products', agentAuth, productController.getAllProducts);
router.get('/products/:id', agentAuth, productController.getProduct);
router.put('/products/:id', agentAuth, productController.updateProduct);
router.delete('/products/:id', agentAuth, productController.deleteProduct);

router.get('/performance/:agentId', agentAuth, productController.getAgentPerformance);
router.get('/clients', agentAuth, productController.getClients);

module.exports = router;
