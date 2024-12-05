const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendRequestControllers = require("../controllers/friendControllers");
const friendValidations = require("../validations/friendValidations");

const friendRequestRouter = Router();

// Fetch all incoming and outgoing friend requests
friendRequestRouter.get(
    "/user/:userId", 
    authenticateJwt, 
    friendRequestControllers.getAllFriendRequests
);

// Send a friend request to a specific user
friendRequestRouter.post(
    "/send/:receiverId", 
    authenticateJwt, 
    friendValidations.validateSendFriendRequest, 
    friendRequestControllers.sendFriendRequest
);

// Get details of a specific friend request
friendRequestRouter.get(
    "/receive/:requestId", 
    authenticateJwt, 
    friendRequestControllers.getFriendRequest
);

// Accept a specific friend request
friendRequestRouter.patch(
    "/accept/:requestId",
    authenticateJwt, 
    friendRequestControllers.acceptFriendRequest
);

// Reject a specific friend request
friendRequestRouter.delete(
    "/reject/:requestId", 
    authenticateJwt, 
    friendValidations.validateRejectFriendRequest, 
    friendRequestControllers.rejectFriendRequest
);

module.exports = friendRequestRouter;
