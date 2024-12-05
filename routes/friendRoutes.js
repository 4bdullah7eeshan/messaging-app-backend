const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendControllers = require("../controllers/friendControllers");
const friendValidations = require("../validations/friendValidations");


const friendRouter = Router();

// Get all friends of a user
friendRouter.get(
    "/u/:userId",
    authenticateJwt,
    friendControllers.getAllFriends
);

// Delete/end a friendship
friendRouter.delete(
    "/:friendId/remove",
    authenticateJwt,
    friendValidations.validateDeleteFriend,
    friendControllers.deleteFriend
);

friendRouter.get(
    "/u/f/:id",
    authenticateJwt,
    friendControllers.checkFriendStatus
)


module.exports = friendRouter;