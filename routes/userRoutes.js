const { Router } = require("express");
const authenticateJwt = require("../middlewares/authenticateJWT");
const userControllers = require("../controllers/userControllers");



const userRouter = Router();
const isAuthenticated = authenticateJwt();

userRouter.get("/", userControllers.getAllUsers);
userRouter.get("/:id", userControllers.getUser);
userRouter.patch("/:id", isAuthenticated,userControllers.updateUser);
userRouter.delete("/:id", isAuthenticated,userControllers.deleteUser);


module.exports = userRouter;