const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");



const userRouter = Router();

userRouter.get("/", userControllers.getAllUsers);
userRouter.get("/:id", userControllers.getUser);
userRouter.patch("/:id", authenticateJwt, userControllers.updateUser);
userRouter.delete("/:id", authenticateJwt, userControllers.deleteUser);


module.exports = userRouter;