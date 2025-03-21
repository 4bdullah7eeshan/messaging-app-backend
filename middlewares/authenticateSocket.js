const jwt = require("jsonwebtoken");

function authenticateSocket(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        socket.user = decoded; // Attach user info to socket
        next();
    });
}

module.exports = { authenticateSocket };
