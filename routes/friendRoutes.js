const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendControllers = require("../controllers/friendControllers");
const friendValidations = require("../validations/friendValidations");


const friendRouter = Router();

friendRouter.get("/", authenticateJwt, friendControllers.getAllFriends);
friendRouter.delete("/:id", friendValidations.validateDeleteFriend, authenticateJwt, friendControllers.deleteFriend);


module.exports = friendRouter;