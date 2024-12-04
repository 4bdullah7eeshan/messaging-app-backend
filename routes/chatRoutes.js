const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");

const chatControllers = require("../controllers/chatController");

const chatRouter = Router();

chatRouter.post("/new", authenticateJwt, chatControllers.createChat);
chatRouter.get("/user/:userId", authenticateJwt, chatControllers.getUserChats);

chatRouter.get("/:chatId", authenticateJwt, chatControllers.getChatById);
chatRouter.patch("/:chatId", authenticateJwt, chatControllers.updateChat);
chatRouter.delete("/:chatId", authenticateJwt, chatControllers.deleteChat);
chatRouter.get("/m/:chatId", authenticateJwt, chatControllers.getChatMessages);
chatRouter.post("/m/:chatId", authenticateJwt, chatControllers.upload.single("file"), chatControllers.addMessageToChat);
chatRouter.get("/user/:userId/search?query=<query>", authenticateJwt, chatControllers.searchChats);

module.exports = chatRouter;
