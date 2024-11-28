const passport = require("passport");

const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err); // Pass error to global error handler
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" }); // Custom error response
    }
    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  })(req, res, next);
};

module.exports = authenticateJWT;
