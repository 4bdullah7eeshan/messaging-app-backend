const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const messageControllers = require("../controllers/messageControllers");

const messageRouter = Router();

// Create a message (private or group)
messageRouter.post("/", authenticateJwt, messageControllers.createMessage);

// Get paginated messages for a private chat or group
// Use query parameter `isGroup` for boolean values
messageRouter.get("/:targetId", authenticateJwt, messageControllers.getMessages);

// Get a single message by ID
messageRouter.get("/:messageId", authenticateJwt, messageControllers.getMessage);

// Update a message by ID
messageRouter.put("/:messageId", authenticateJwt, messageControllers.updateMessage);

// Delete a message by ID
messageRouter.delete("/:messageId", authenticateJwt, messageControllers.deleteMessage);

module.exports = messageRouter;
