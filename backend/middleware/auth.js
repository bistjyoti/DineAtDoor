import jwt from 'jsonwebtoken';

const isJwtToken = (token) => {
    return typeof token === 'string' && token.split('.').length === 3;
};

const authMiddleware = async (req, res, next) => {
    const token = req.headers.token || req.headers.authorization?.split(' ')[1];
    if (!token || !isJwtToken(token) || token === 'undefined' || token === 'null') {
        return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch (error) {
        console.log('Auth middleware error:', error.message || error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authMiddleware;