const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: false, sparse: true }, // Sparse allows multiple nulls if an index exists
    ebayAccountName: String,
    ebayToken: String, // User token for this specific client
    ebayRefreshToken: String,
    ebayTokenExpiry: Date,
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    
    // Fixed rules/policies for this client
    defaultPolicies: {
        fulfillment: mongoose.Schema.Types.Mixed,
        payment: mongoose.Schema.Types.Mixed,
        return: mongoose.Schema.Types.Mixed,
        location: mongoose.Schema.Types.Mixed
    },
    defaultRules: {
        condition_note: String,
        custom_condition_note: String,
        price_markup: Number,
        title_template: String,
        title_sequence: [String],
        description_prompt: String
    },
    
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    allowApiListing: { type: Boolean, default: false },
    allowExtensionListing: { type: Boolean, default: true },
    allowAiFetching: { type: Boolean, default: true },
    allowEbayImport: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
