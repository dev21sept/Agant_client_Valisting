const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    agentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: Date,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);
