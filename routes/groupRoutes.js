const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const groupControllers = require("../controllers/groupControllers");

const groupRouter = Router();

groupRouter.get("/", groupControllers.getAllGroups);
groupRouter.get("/:id", groupControllers.getGroup);
groupRouter.patch("/:id", authenticateJwt, groupControllers.updateGroup);
groupRouter.delete("/:id", authenticateJwt, groupControllers.deleteGroup);
groupRouter.get("/:id/members", authenticateJwt, groupControllers.getAllGroupMembers);
groupRouter.get("/:id/join", authenticateJwt, groupControllers.joinGroup);
groupRouter.patch(":id/members/add", authenticateJwt, groupControllers.addUserToGroup);
groupRouter.patch(":/id/members/remove", authenticateJwt, groupControllers.removeUserFromGroup);


module.exports = groupRouter;