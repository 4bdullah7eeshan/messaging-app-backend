const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");
const groupControllers = require("../controllers/groupControllers");


const userRouter = Router();
const isAuthenticated = authenticateJwt();

userRouter.get("/messages", isAuthenticated ,userControllers.getMessages);
userRouter.get("/groups", isAuthenticated, groupControllers.getAllUsersGroups);
userRouter.get("/friends", )


module.exports = userRouter;