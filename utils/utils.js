const JWT = require('jsonwebtoken');
const key = process.env.JWT_KEY;
exports.authenticateToken = (req, res, next) => {
    const {jwt} = req.body;
    // const token = jwt && jwt.split('.')[1];
    // if (!token) return res.status(401).json({ error: 'Authentication failed' });
    try {
        const decoded = JWT.verify(jwt, key);
        req.body['email'] = decoded.userEmail;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

exports.generateToken = (res, email) => {
    const token = JWT.sign({ userEmail: email }, key);
    res.status(200).json({ token: token });
}