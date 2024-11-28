const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");
const userValidations = require("../validations/userValidations");



const userRouter = Router();

userRouter.get("/", userControllers.getAllUsers);
userRouter.get("/:id", userValidations.validateGetUser, userControllers.getUser);
userRouter.patch("/:id", userValidations.validateUpdateUser, authenticateJwt, userControllers.updateUser);
userRouter.delete("/:id", userValidations.validateDeleteUser, authenticateJwt, userControllers.deleteUser);


module.exports = userRouter;