const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent_client_controller');
const { auth, isAdmin } = require('../middleware/auth');

// Public Login
router.post('/agents/login', agentController.agentLogin);

// Agents (Admin Only)
router.post('/agents', auth, isAdmin, agentController.createAgent);
router.get('/agents', auth, isAdmin, agentController.getAgents);
router.get('/agents/:agentId/performance', auth, isAdmin, agentController.getAgentPerformance);
router.put('/agents/:id', auth, isAdmin, agentController.updateAgent);
router.delete('/agents/:id', auth, isAdmin, agentController.deleteAgent);

// Clients (Admin Only)
router.post('/clients', auth, isAdmin, agentController.createClient);
router.get('/clients', auth, isAdmin, agentController.getClients);
router.put('/clients/:id', auth, isAdmin, agentController.updateClient);
router.delete('/clients/:id', auth, isAdmin, (req, res, next) => {
    console.log(`[ROUTE] Attempting to DELETE client: ${req.params.id}`);
    next();
}, agentController.deleteClient);
router.post('/clients/:id/disconnect', auth, isAdmin, agentController.disconnectClientEbay);
router.get('/clients/:id/policies', auth, isAdmin, agentController.getClientPolicies);

// Dashboard (Admin Only)
router.get('/dashboard/admin-stats', auth, isAdmin, agentController.getAdminDashboardStats);

module.exports = router;
