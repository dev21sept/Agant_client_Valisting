const Agent = require('../models/Agent');
const Client = require('../models/Client');
const Product = require('../models/Product');

// --- AGENT MANAGEMENT ---

exports.agentLogin = async (req, res) => {
    try {
        const { agentId, password } = req.body;
        const agent = await Agent.findOne({ agentId, password });
        if (!agent) {
            return res.status(401).json({ error: 'Invalid Agent ID or Password' });
        }
        
        // Find assigned client
        const client = await Client.findOne({ assignedAgents: { $in: [agent._id] } });
        
        res.json({ 
            success: true, 
            role: 'agent', 
            user: { 
                id: agent._id, 
                agentId: agent.agentId, 
                name: agent.name,
                clientId: client ? client._id : null,
                allowApiListing: client ? client.allowApiListing : false,
                allowExtensionListing: client ? client.allowExtensionListing : true,
                allowAiFetching: client ? client.allowAiFetching : false,
                allowEbayImport: client ? client.allowEbayImport : false,
                defaultRules: client ? client.defaultRules : null,
                defaultPolicies: client ? client.defaultPolicies : null
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAgent = async (req, res) => {
    try {
        const { agentId, password, name } = req.body;
        const newAgent = new Agent({ agentId, password, name });
        await newAgent.save();
        res.json({ success: true, message: 'Agent created successfully', agent: newAgent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAgents = async (req, res) => {
    try {
        const agents = await Agent.find().sort({ created_at: -1 });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CLIENT MANAGEMENT ---

exports.createClient = async (req, res) => {
    try {
        const { name, email, mobileNumber, ebayAccountName, ebayPassword, assignedAgents, defaultPolicies, defaultRules, allowApiListing, allowExtensionListing, allowAiFetching, allowEbayImport } = req.body;
        
        const newClient = new Client({ 
            name, 
            email,
            mobileNumber,
            ebayAccountName,
            ebayPassword,
            assignedAgents: assignedAgents || [],
            defaultPolicies, 
            defaultRules,
            allowApiListing: allowApiListing ?? false,
            allowExtensionListing: allowExtensionListing ?? true,
            allowAiFetching: allowAiFetching ?? true,
            allowEbayImport: allowEbayImport ?? true
        });
        
        await newClient.save();
        res.json({ success: true, message: 'Client created successfully', client: newClient });
    } catch (error) {
        console.error('Create Client Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().populate('assignedAgents').sort({ created_at: -1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- DASHBOARD STATS ---

exports.getAdminDashboardStats = async (req, res) => {
    try {
        // Aggregate stats for all agents
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: '$agentId',
                    totalListings: { $sum: 1 },
                    listedCount: { 
                        $sum: { $cond: [{ $eq: ['$status', 'listed'] }, 1, 0] } 
                    },
                    aiCount: { 
                        $sum: { $cond: [{ $eq: ['$source', 'ai'] }, 1, 0] } 
                    }
                }
            },
            {
                $lookup: {
                    from: 'agents',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agentInfo'
                }
            },
            {
                $project: {
                    totalListings: 1,
                    listedCount: 1,
                    aiCount: 1,
                    agentInfo: { $ifNull: [{ $arrayElemAt: ['$agentInfo', 0] }, { name: 'Admin/System' }] }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAgentPerformance = async (req, res) => {
    try {
        const { agentId } = req.params;
        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0));
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

        const [today, week, month] = await Promise.all([
            Product.countDocuments({ agentId, created_at: { $gte: startOfDay } }),
            Product.countDocuments({ agentId, created_at: { $gte: startOfWeek } }),
            Product.countDocuments({ agentId, created_at: { $gte: startOfMonth } })
        ]);

        res.json({ today, week, month });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, client: updatedClient });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.disconnectClientEbay = async (req, res) => {
    try {
        const { id } = req.params;
        await Client.findByIdAndUpdate(id, {
            ebayToken: null,
            ebayRefreshToken: null,
            ebayTokenExpiry: null,
            ebayAccountName: null
        });
        res.json({ success: true, message: 'eBay disconnected for this client' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getClientPolicies = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id);
        if (!client || !client.ebayToken) {
            return res.status(401).json({ error: 'Client eBay not connected' });
        }

        const ebayService = require('../services/ebayApiService');
        const [fulfillment, payment, returns] = await Promise.allSettled([
            ebayService.getFulfillmentPolicies(client.ebayToken),
            ebayService.getPaymentPolicies(client.ebayToken),
            ebayService.getReturnPolicies(client.ebayToken)
        ]);

        // Also fetch locations
        const axios = require('axios');
        let locations = [];
        try {
            const locRes = await axios.get('https://api.ebay.com/sell/inventory/v1/location', {
                headers: { 'Authorization': `Bearer ${client.ebayToken}` }
            });
            locations = locRes.data.locations || [];
        } catch (e) { console.error('Loc fetch error'); }

        res.json({ 
            fulfillment: fulfillment.status === 'fulfilled' ? fulfillment.value : [], 
            payment: payment.status === 'fulfilled' ? payment.value : [], 
            returns: returns.status === 'fulfilled' ? returns.value : [],
            locations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, agent: updatedAgent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const Agent = require('../models/Agent');
        const Client = require('../models/Client');
        await Agent.findByIdAndDelete(id);
        // Also unassign from clients
        await Client.updateMany({ assignedAgents: id }, { $pull: { assignedAgents: id } });
        res.json({ success: true, message: 'Agent deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const Client = require('../models/Client');
        await Client.findByIdAndDelete(id);
        res.json({ success: true, message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
