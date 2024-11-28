const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendControllers = require("../controllers/friendControllers");

const friendRouter = Router();

friendRouter.get("/", friendControllers.getAllFriends);
friendRouter.delete("/:id", authenticateJwt, friendControllers.deleteFriend);


module.exports = friendRouter;