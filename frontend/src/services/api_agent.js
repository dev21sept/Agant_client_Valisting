import axios from 'axios';

const api = axios.create({
    baseURL: 'https://agant-client-valisting-m52l.vercel.app/api/agent-tools',
    timeout: 120000,
});

// Helper for other modules (AI, Scraper) that might not be under /agent-tools yet
const mainApi = axios.create({
    baseURL: 'https://agant-client-valisting-m52l.vercel.app/api',
    timeout: 120000,
});

// Interceptor for both
const attachHeaders = (config) => {
    const sessionStr = localStorage.getItem('va_admin_session');
    if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.role === 'agent') {
            config.headers['x-user-id'] = session.id;
            config.headers['x-user-role'] = 'agent';
        } else if (localStorage.getItem('vaster_role') === 'workforce') {
            config.headers['x-user-id'] = session.id || 'admin_root';
            config.headers['x-user-role'] = 'workforce';
        }
    }
    return config;
};

api.interceptors.request.use(attachHeaders);
mainApi.interceptors.request.use(attachHeaders);

// AGENT TOOLS (Isolated)
export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (data) => {
    const response = await api.post('/products', data);
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getAgentPerformance = async (agentId) => {
    const response = await api.get(`/performance/${agentId}`);
    return response.data;
};

export const getClients = async () => {
    const response = await api.get('/clients');
    return response.data;
};

// SHARED TOOLS (Using mainApi but with isolation headers)
export const getEbayAuthUrl = async (state = 'dashboard') => {
    const response = await mainApi.get(`/ebay/auth-url?state=${state}`);
    return response.data;
};

export const syncEbayData = async () => {
    const response = await mainApi.get('/ebay/sync');
    return response.data;
};

export const getEbayConnectionStatus = async () => {
    const response = await mainApi.get('/ebay/connection-status');
    return response.data;
};

export const disconnectEbay = async () => {
    const response = await mainApi.post('/ebay/disconnect');
    return response.data;
};

export const listProduct = async (productId, isDraft = false) => {
    const response = await mainApi.post(`/listing/ebay/${productId}${isDraft ? '?draft=true' : ''}`);
    return response.data;
};

export const fetchEbayProduct = async (url) => {
    const response = await mainApi.post('/scraper/fetch-ebay-product', { url });
    return response.data;
};

export const scrapeEbayDescription = async (url) => {
    const response = await mainApi.post('/scraper/scrape-ebay', { url });
    return response.data;
};

export const getCategoryAspects = async (categoryId) => {
    const response = await mainApi.get(`/scraper/aspects/${categoryId}`);
    return response.data;
};

export const getCategoryConditions = async (categoryId) => {
    const response = await mainApi.get(`/ebay/conditions?categoryId=${categoryId}`);
    return response.data;
};

export const getEbayPolicies = async () => {
    const response = await mainApi.get('/ebay/policies');
    return response.data;
};

export const getEbayLocations = async () => {
    const response = await mainApi.get('/ebay/locations');
    return response.data;
};

export const analyzeProduct = async (data) => {
    const response = await mainApi.post('/ai/analyze-product', data);
    return response.data;
};

export const searchCategories = async (query) => {
    const response = await mainApi.get(`/ai/search-categories?query=${query}`);
    return response.data;
};

export const saveAiListing = async (data) => {
    const response = await mainApi.post('/ai/save-listing', data);
    return response.data;
};

export const getFetchRules = async () => {
    const response = await mainApi.get('/fetch-rules');
    return response.data;
};

export const createFetchRule = async (data) => {
    const response = await mainApi.post('/fetch-rules', data);
    return response.data;
};

export const updateFetchRule = async (id, data) => {
    const response = await mainApi.put(`/fetch-rules/${id}`, data);
    return response.data;
};

export const deleteFetchRule = async (id) => {
    const response = await mainApi.delete(`/fetch-rules/${id}`);
    return response.data;
};

export const getOrders = async () => {
    const response = await mainApi.get('/orders');
    return response.data;
};

export const getSavedConditionNotes = async () => {
    const response = await mainApi.get('/fetch-rules/condition-notes');
    return response.data;
};

export default api;
