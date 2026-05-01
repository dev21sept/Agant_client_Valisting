const agentAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole || userRole !== 'agent') {
        return res.status(401).json({ error: 'Unauthorized: Agent access only' });
    }

    req.user = {
        id: userId,
        role: userRole
    };
    next();
};

module.exports = { agentAuth };
