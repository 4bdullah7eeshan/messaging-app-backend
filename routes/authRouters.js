const { Router } = require("express");
const passport = require("passport");
const userControllers = require("../controllers/userControllers");
const userValidations = require("../validations/userValidations");
const authenticateJwt = require("../middlewares/authenticateJWT");



const authRouter = Router();

authRouter.post("/sign-up", userValidations.validateCreateUser, userControllers.createUser);
authRouter.post("/sign-in", userValidations.validateLoginUser, passport.authenticate("local"), userControllers.loginUser);
authRouter.post("/sign-out", userControllers.logoutUser);
authRouter.get("/verify-token", userControllers.verifyToken);

module.exports = authRouter;