const jwt = require('jsonwebtoken');
const key = process.env.JWT_KEY;
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const {email} = req.body;
    if (!token) return res.status(401).json({ error: 'Authentication failed' });
    try {
        const decoded = jwt.verify(token, key);
        if(decoded.userEmail != email) throw error;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

exports.generateToken = (res, email) => {
    const token = jwt.sign({ userEmail: email }, key);
    res.status(200).json({ token: token });
}