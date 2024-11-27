const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");
const groupControllers = require("../controllers/groupControllers");
const friendsControllers = require("../controllers/friendControllers");


const userRouter = Router();
const isAuthenticated = authenticateJwt();

userRouter.get("/", userControllers.getAllUsers);
userRouter.get("/:id", userControllers.getUser);
userRouter.patch("/:id", userControllers.updateUser);
userRouter.delete("/:id", userControllers.deleteUser);
userRouter.get("/messages", isAuthenticated , userControllers.getMessages);
userRouter.get("/groups", isAuthenticated, groupControllers.getAllUsersGroups);
userRouter.get("/friends", isAuthenticated, friendsControllers.getAllFriends);
userRouter.get("/friend-requests", isAuthenticated, friendsControllers.getAllFriendRequests);


module.exports = userRouter;