const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

const isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(404).json({ error: 'token not found'});
        }

        const decodedToken = jwt.verify(token, JWT_SECRET);

        req.user = decodedToken;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token'});
    }
}

const isAdmin = (req, res, next) => {
    // Verifica si req.user está definido
    if (!req.user) {
        return res.status(401).json({ error: "req.user not found" });
    }

    // Verifica si el usuario es administrador
    if (!req.user.isAdmin) { // Cambiado para manejar valores como false/null/undefined
        return res.status(403).json('Admin access required');
    }

    // Si todo está bien, continúa con la solicitud
    next();
};


module.exports = { isAuthenticated, isAdmin };