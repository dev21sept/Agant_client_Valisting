const agentAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole || (userRole !== 'agent' && userRole !== 'admin' && userRole !== 'workforce')) {
        return res.status(401).json({ error: 'Unauthorized: Access restricted to agents, admins, or workforce' });
    }

    req.user = {
        id: userId,
        role: userRole
    };
    next();
};

module.exports = { agentAuth };
