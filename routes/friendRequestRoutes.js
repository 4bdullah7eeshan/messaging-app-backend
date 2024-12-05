const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendRequestControllers = require("../controllers/friendControllers");
const friendValidations = require("../validations/friendValidations");

const friendRequestRouter = Router();

// Fetch all incoming and outgoing friend requests
friendRequestRouter.get(
    "/", 
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
    "/:requestId", 
    authenticateJwt, 
    friendRequestControllers.getFriendRequest
);

// Accept a specific friend request
friendRequestRouter.patch(
    "/:requestId/accept", 
    authenticateJwt, 
    friendValidations.validateAcceptFriendRequest, 
    friendRequestControllers.acceptFriendRequest
);

// Reject a specific friend request
friendRequestRouter.delete(
    "/:requestId/reject", 
    authenticateJwt, 
    friendValidations.validateRejectFriendRequest, 
    friendRequestControllers.rejectFriendRequest
);

module.exports = friendRequestRouter;
