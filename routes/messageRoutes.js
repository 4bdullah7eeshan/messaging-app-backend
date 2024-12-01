const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const messageControllers = require("../controllers/messageControllers");
const messageValidations = require("../validations/messageValidations");


const messageRouter = Router();

// Create a message (private or group)
messageRouter.post("/", messageValidations.validateCreateMessage, authenticateJwt, messageControllers.createMessage);

// Get paginated messages for a private chat or group
// Use query parameter `isGroup` for boolean values
messageRouter.get("/:targetId", authenticateJwt, messageControllers.getMessages);

// Get a single message by ID
messageRouter.get("/:messageId", messageValidations.validateGetMessage, authenticateJwt, messageControllers.getMessage);

// Update a message by ID
messageRouter.put("/:messageId", authenticateJwt, messageControllers.updateMessage);

// Delete a message by ID
messageRouter.delete("/:messageId", messageValidations.validateDeleteMessage, authenticateJwt, messageControllers.deleteMessage);

messageRouter.get("/c", authenticateJwt, messageControllers.getDistinctChats);
module.exports = messageRouter;
