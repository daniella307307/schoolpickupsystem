const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Malformed token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attach user info
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden: Access denied" });
        }

        next();
    };
};


module.exports = { verifyToken, authorizeRole };