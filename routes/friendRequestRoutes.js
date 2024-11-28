const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendRequestControllers = require("../controllers/friendControllers");

const friendRequestRouter = Router();

// Fetch all incoming and outgoing friend requests
friendRequestRouter.get("/", authenticateJwt, friendRequestControllers.getAllFriendRequests);

// Send a friend request to a specific user
friendRequestRouter.post("/:receiverId", authenticateJwt, friendRequestControllers.sendFriendRequest);

// Get details of a specific friend request
friendRequestRouter.get("/:requestId", authenticateJwt, friendRequestControllers.getFriendRequest);

// Accept a specific friend request
friendRequestRouter.post("/:requestId/accept", authenticateJwt, friendRequestControllers.acceptFriendRequest);

// Reject a specific friend request
friendRequestRouter.delete("/:requestId/reject", authenticateJwt, friendRequestControllers.rejectFriendRequest);

// Delete an existing friendship
friendRequestRouter.delete("/:friendId", authenticateJwt, friendRequestControllers.deleteFriend);

module.exports = friendRequestRouter;

