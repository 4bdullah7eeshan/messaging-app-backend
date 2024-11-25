const { Router } = require("express");
const passport = require("passport");
const userControllers = require("../controllers/userControllers");


const authRouter = Router();

authRouter.post("/sign-up", userControllers.createUser);
authRouter.post("/sign-in", passport.authenticate("local"), userControllers.loginUser);
authRouter.post("/sign-out", userControllers.logoutUser);

module.exports = authRouter;