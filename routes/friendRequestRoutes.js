const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const friendRequestControllers = require("../controllers/friendControllers");

const friendRequestRouter = Router();
const isAuthenticated = authenticateJwt();

// Fetch all incoming and outgoing friend requests
friendRequestRouter.get("/", isAuthenticated, friendRequestControllers.getAllFriendRequests);

// Send a friend request to a specific user
friendRequestRouter.post("/:receiverId", isAuthenticated, friendRequestControllers.sendFriendRequest);

// Get details of a specific friend request
friendRequestRouter.get("/:requestId", isAuthenticated, friendRequestControllers.getFriendRequest);

// Accept a specific friend request
friendRequestRouter.post("/:requestId/accept", isAuthenticated, friendRequestControllers.acceptFriendRequest);

// Reject a specific friend request
friendRequestRouter.delete("/:requestId/reject", isAuthenticated, friendRequestControllers.rejectFriendRequest);

// Delete an existing friendship
friendRequestRouter.delete("/:friendId", isAuthenticated, friendRequestControllers.deleteFriend);

module.exports = friendRequestRouter;

