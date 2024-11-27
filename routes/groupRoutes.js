const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const groupControllers = require("../controllers/groupControllers");

const groupRouter = Router();
const isAuthenticated = authenticateJwt();

groupRouter.get("/", groupControllers.getAllGroups);
groupRouter.get("/:id", groupControllers.getGroup);
groupRouter.patch("/:id", isAuthenticated, groupControllers.updateGroup);
groupRouter.delete("/:id", isAuthenticated, groupControllers.deleteGroup);
groupRouter.get("/:id/members", isAuthenticated, groupControllers.getAllGroupMembers);
groupRouter.get("/:id/join", isAuthenticated, groupControllers.joinGroup);
groupRouter.patch(":id/members/add", isAuthenticated, groupControllers.addUserToGroup);
groupRouter.patch(":/id/members/remove", isAuthenticated, groupControllers.removeUserFromGroup);


module.exports = groupRouter;