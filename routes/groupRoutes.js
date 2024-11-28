const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const groupControllers = require("../controllers/groupControllers");
const groupValidations = require("../validations/groupValidations");

const groupRouter = Router();

groupRouter.post("/:id", groupValidations.validateCreateGroup, groupControllers.createGroup);
groupRouter.get("/", groupControllers.getAllGroups);
groupRouter.get("/:id", groupValidations.validateGetGroup, groupControllers.getGroup);
groupRouter.patch("/:id", groupValidations.validateUpdateGroup, authenticateJwt, groupControllers.updateGroup);
groupRouter.delete("/:id", groupValidations.validateDeleteGroup, authenticateJwt, groupControllers.deleteGroup);
groupRouter.get("/:id/members", authenticateJwt, groupControllers.getAllGroupMembers);
groupRouter.get("/:id/join", authenticateJwt, groupControllers.joinGroup);
groupRouter.patch(":id/members/add", groupValidations.validateAddUserToGroup, authenticateJwt, groupControllers.addUserToGroup);
groupRouter.patch(":/id/members/remove", groupValidations.validateRemoveUserFromGroup, authenticateJwt, groupControllers.removeUserFromGroup);


module.exports = groupRouter;