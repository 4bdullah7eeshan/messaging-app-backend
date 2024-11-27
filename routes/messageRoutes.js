const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const messageControllers = require("../controllers/messageControllers");

const messageRouter = Router();
const isAuthenticated = authenticateJwt();

// Create a message (private or group)
messageRouter.post("/", isAuthenticated, messageControllers.createMessage);

// Get paginated messages for a private chat or group
// Use query parameter `isGroup` for boolean values
messageRouter.get("/:targetId", isAuthenticated, messageControllers.getMessages);

// Get a single message by ID
messageRouter.get("/:messageId", isAuthenticated, messageControllers.getMessage);

// Update a message by ID
messageRouter.put("/:messageId", isAuthenticated, messageControllers.updateMessage);

// Delete a message by ID
messageRouter.delete("/:messageId", isAuthenticated, messageControllers.deleteMessage);

module.exports = messageRouter;
