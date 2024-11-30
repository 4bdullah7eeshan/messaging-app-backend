const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");
const userValidations = require("../validations/userValidations");



const userRouter = Router();

userRouter.get("/", userControllers.getAllUsers);
userRouter.get("/:id", userValidations.validateGetUser, userControllers.getUser);
userRouter.patch("/:id/textual", authenticateJwt, userControllers.updateTextualData);
userRouter.patch("/:id/avatar", authenticateJwt, userControllers.upload.single("avatar"), userControllers.updateAvatar); // For avatar

userRouter.delete("/:id", userValidations.validateDeleteUser, authenticateJwt, userControllers.deleteUser);
userRouter.get("/profile", authenticateJwt, userControllers.getLoggedInUser);

module.exports = userRouter;