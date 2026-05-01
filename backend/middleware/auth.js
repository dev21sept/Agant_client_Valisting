const authMiddleware = (req, res, next) => {
    // Original loose auth for admin
    next();
};

const isAdmin = (req, res, next) => {
    // Original loose admin check
    next();
};

module.exports = { auth: authMiddleware, isAdmin };
