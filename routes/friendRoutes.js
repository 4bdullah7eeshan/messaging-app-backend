const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendControllers = require("../controllers/friendControllers");

const friendRouter = Router();
const isAuthenticated = authenticateJwt();

friendRouter.get("/", friendControllers.getAllFriends);
friendRouter.delete("/:id", isAuthenticated, friendControllers.deleteFriend);


module.exports = friendRouter;